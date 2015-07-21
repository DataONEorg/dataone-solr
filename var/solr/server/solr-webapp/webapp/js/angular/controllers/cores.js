/*
 Licensed to the Apache Software Foundation (ASF) under one or more
 contributor license agreements.  See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 The ASF licenses this file to You under the Apache License, Version 2.0
 (the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// @todo test optimize (delete stuff, watch button appear, test button/form)
solrAdminApp.controller('CoreAdminController',
  ['$scope', '$routeParams', '$location', '$timeout', 'Cores',
    function($scope, $routeParams, $location, $timeout, Cores){
      $scope.resetMenu("cores");
      $scope.currentCore = $routeParams.core;
      $scope.refresh = function() {
        Cores.get(function(data) {
          var coreCount = 0;
          // @todo mark 'current' core in navigation with 'current' style
          for (_obj in data.status) coreCount++;
          $scope.hasCores = coreCount >0;
          if (!$scope.currentCore && coreCount==0) {
            // @todo Do something if no cores defined
            return;
          } else if (!$scope.currentCore) {
            for (firstCore in data.status) break;
            $scope.currentCore = firstCore;
            $location.path("/~cores/" + $scope.currentCore).replace();
          }
          $scope.core = data.status[$scope.currentCore];
          var cores = [];
          for (var core in data.status) {
             cores.push(data.status[core]);
          }
          $scope.cores = cores;
          $scope.$parent.refresh();
        });
      };
      $scope.showAddCore = function() {
        $scope.hideAll();
        $scope.showAdd = true;
        $scope.newCore = {
          name: "new_core",
          dataDir: "data",
          instanceDir: "",
          config: "solrconfig.xml",
          schema: "schema.xml"
        };
      };

      $scope.addCore = function() {
        if (!$scope.newCore.name) {
          $scope.addMessage = "Please provide a core name";
        } else if (false) { //@todo detect whether core exists
          $scope.AddMessage = "A core with that name already exists";
        } else {
          Cores.add({
            name: $scope.newCore.name,
            instanceDir: $scope.newCore.instanceDir,
            config: $scope.newCore.config,
            scheme: $scope.newCore.schema,
            dataDir: $scope.newCore.dataDir
          }, function(data) {
            $scope.cancelAddCore();
            $location.path("/~cores/" + $scope.newCore.name);
          });
        }
      };

      $scope.cancelAddCore = function() {
        delete $scope.addMessage;
        $scope.showAdd = false
      };

      $scope.unloadCore = function() {
        var answer = confirm( 'Do you really want to unload Core "' + $scope.currentCore + '"?' );
        if( !answer ) return;
        Cores.unload({core: $scope.currentCore}, function(data) {
          $location.path("/~cores");
        });
      };

      $scope.showRenameCore = function() {
        $scope.hideAll();
        $scope.showRename = true;
      };

      $scope.renameCore = function() {
        if (!$scope.other) {
          $scope.renameMessage = "Please provide a new name for the " + $scope.currentCore + " core";
        } else if ($scope.other == $scope.currentCore) {
          $scope.renameMessage = "New name must be different from the current one";
        } else {
          Cores.rename({core:$scope.currentCore, other: $scope.other}, function(data) {
            console.log("RENAME2");
            $location.path("/~cores/" + $scope.other);
            $scope.cancelRename();
          });
        }
      };

      $scope.cancelRenameCore = function() {
        $scope.showRename = false;
        delete $scope.renameMessage;
        $scope.other = "";
      };

      $scope.showSwapCores = function() {
        $scope.hideAll();
        $scope.showSwap = true;
      };

      $scope.swapCores = function() {
        if ($scope.swapOther) {
          $swapMessage = "Please select a core to swap with";
        } else if ($scope.swapOther == $scope.currentCore) {
          $swapMessage = "Cannot swap with the same core";
        } else {
          Cores.swap({core: $scope.currentCore, other: $scope.swapOther}, function(data) {
            $location.path("/~cores/" + $scope.swapOther);
            delete $scope.swapOther;
            $scope.cancelSwap();
          });
        }
      };

      $scope.cancelSwapCores = function() {
        delete $scope.swapMessage;
        $scope.showSwap = false;
      }

      $scope.reloadCore = function() {
        Cores.reload({core: $scope.currentCore},
          function(successData) {
            $scope.reloadSuccess = true;
            $timeout(function() {$scope.reloadSuccess=false}, 1000);
          },
          function(failureData) {
            $scope.reloadFailure = true;
            $timeout(function() {$scope.reloadFailure=false}, 1000);
            $scope.currentCore = null;
            $scope.refresh();
            $location.path("/~cores");
          });
      };

      $scope.hideAll = function() {
        $scope.showRename = false;
        $scope.showAdd = false;
        $scope.showSwap = false;
      };

      $scope.optimizeCore = function() {
      };

      $scope.refresh();
    }
]);

/**************
  'cores_load_data',
  function( event, params )
  {
    $.ajax
    (
      {
        url : app.config.solr_path + app.config.core_admin_path + '?wt=json',
        dataType : 'json',
        success : function( response, text_status, xhr )
        {
          if( params.only_failures )
          {
            app.check_for_init_failures( response );
            return true;
          }


=========== NO CORES
        error : function()
        {
          sammy.trigger
          (
            'cores_load_template',
            {
              content_element : content_element,
              callback : function()
              {
                var cores_element = $( '#cores', content_element );
                var navigation_element = $( '#navigation', cores_element );
                var data_element = $( '#data', cores_element );
                var core_data_element = $( '#core-data', data_element );
                var index_data_element = $( '#index-data', data_element );

                // layout

                var ui_block = $( '#ui-block' );
                var actions_element = $( '.actions', cores_element );
                var div_action = $( 'div.action', actions_element );

                ui_block
                  .css( 'opacity', 0.7 )
                  .width( cores_element.width() + 10 )
                  .height( cores_element.height() );

                if( $( '#cloud.global' ).is( ':visible' ) )
                {
                  $( '.cloud', div_action )
                    .show();
                }

                $( 'button.action', actions_element )
                  .die( 'click' )
                  .live
                  (
                    'click',
                    function( event )
                    {
                      var self = $( this );

                      self
                        .toggleClass( 'open' );

                      $( '.action.' + self.attr( 'id' ), actions_element )
                        .trigger( 'open' );

                      return false;
                    }
                  );

                div_action
                  .die( 'close' )
                  .live
                  (
                    'close',
                    function( event )
                    {
                      div_action.hide();
                      ui_block.hide();
                    }
                  )
                  .die( 'open' )
                  .live
                  (
                    'open',
                    function( event )
                    {
                      var self = $( this );
                      var rel = $( '#' + self.data( 'rel' ) );

                      self
                        .trigger( 'close' )
                        .show()
                        .css( 'left', rel.position().left );

                      ui_block
                        .show();
                    }
                  );

                $( 'form button.reset', actions_element )
                  .die( 'click' )
                  .live
                  (
                    'click',
                    function( event )
                    {
                      $( this ).closest( 'div.action' )
                        .trigger( 'close' );
                    }
                  );

                $( 'form', div_action )
                  .ajaxForm
                  (
                    {
                      url : app.config.solr_path + app.config.core_admin_path + '?wt=json&indexInfo=false',
                      dataType : 'json',
                      beforeSubmit : function( array, form, options )
                      {
                        $( 'button[type="submit"] span', form )
                          .addClass( 'loader' );
                      },
                      success : function( response, status_text, xhr, form )
                      {
                        delete app.cores_data;
                        sammy.refresh();

                        $( 'button.reset', form )
                          .trigger( 'click' );
                      },
                      error : function( xhr, text_status, error_thrown )
                      {
                        var response = null;
                        eval( 'response = ' + xhr.responseText + ';' );

                        var error_elem = $( '.error', div_action.filter( ':visible' ) );
                        error_elem.show();
                        $( 'span', error_elem ).text( response.error.msg );
                      },
                      complete : function()
                      {
                        $( 'button span.loader', actions_element )
                          .removeClass( 'loader' );
                      }
                    }
                  );

                // --

                $( '#add', content_element )
                  .trigger( 'click' );

                $( '[data-rel="add"] input[type="text"]:first', content_element )
                  .focus();
              }
            }
          );
        }
      }
    );
  }
);

// #/~cores
sammy.get
(
  /^#\/(~cores)\//,
  function( context )
  {
    var content_element = $( '#content' );

    var path_parts = this.path.match( /^(.+\/~cores\/)(.*)$/ );
    var current_core = path_parts[2];

    sammy.trigger
    (
      'cores_load_data',
      {
        error : function()
        {
          context.redirect( '#/' + context.params.splat[0] );
        },
        success : function( cores )
        {
          sammy.trigger
          (
            'cores_load_template',
            {
              content_element : content_element,
              callback : function()
              {
                var cores_element = $( '#cores', content_element );
                var navigation_element = $( '#navigation', cores_element );
                var data_element = $( '#data', cores_element );
                var core_data_element = $( '#core-data', data_element );
                var index_data_element = $( '#index-data', data_element );

                cores_element
                  .removeClass( 'empty' );

                var core_data = cores[current_core];
                var core_basepath = $( '#' + current_core, app.menu_element ).attr( 'data-basepath' );

                var core_names = [];
                var core_selects = $( '#actions select', cores_element );

                $( 'option[value="' + current_core + '"]', core_selects.filter( '.other' ) )
                  .remove();

                $( 'input[data-core="current"]', cores_element )
                  .val( current_core );

                // layout

                var ui_block = $( '#ui-block' );
                var actions_element = $( '.actions', cores_element );
                var div_action = $( 'div.action', actions_element );

                ui_block
                  .css( 'opacity', 0.7 )
                  .width( cores_element.width() + 10 )
                  .height( cores_element.height() );

                if( $( '#cloud.global' ).is( ':visible' ) )
                {
                  $( '.cloud', div_action )
                    .show();
                }

                var form_callback = {

                  rename : function( form, response )
                  {
                    var url = path_parts[1] + $( 'input[name="other"]', form ).val();
                    context.redirect( url );
                  }

                };

                $( 'form', div_action )
                  .ajaxForm
                  (
                    {
                      url : app.config.solr_path + app.config.core_admin_path + '?wt=json&indexInfo=false',
                      success : function( response, status_text, xhr, form )
                      {
                        var action = $( 'input[name="action"]', form ).val().toLowerCase();

                        delete app.cores_data;

                        if( form_callback[action] )
                        {
                         form_callback[action]( form, response );
                        }
                        else
                        {
                          sammy.refresh();
                        }

                        $( 'button.reset', form )
                          .trigger( 'click' );
                      },
                  );

                $( '#actions #unload', cores_element )
                      var ret = confirm( 'Do you really want to unload Core "' + current_core + '"?' );
                      if( !ret )
                        return false;

                          url : app.config.solr_path + app.config.core_admin_path + '?wt=json&action=UNLOAD&core=' + current_core,
                          success : function( response, text_status, xhr )
                          {
                            delete app.cores_data;
                            context.redirect( path_parts[1].substr( 0, path_parts[1].length - 1 ) );
                          },

                optimize_button
                          url : core_basepath + '/update?optimize=true&waitFlush=true&wt=json',
                          success : function( response, text_status, xhr )

******/
