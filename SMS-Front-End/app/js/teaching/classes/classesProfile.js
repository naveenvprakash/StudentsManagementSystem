angular.module('classes')
    .directive('chart', chartDirective)
    .controller('classesProfileController', function ($scope, $resource, $state, $stateParams, $mdDialog, ClassesService, AssociationsService, ImpartsService, toastService) {

        var vm = this;

        // Vars:
        vm.controllerName = 'classesProfileController';
        vm.classId = $stateParams.classId;

        vm.defaultAvatar = 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcThQiJ2fHMyU37Z0NCgLVwgv46BHfuTApr973sY7mao_C8Hx_CDPrq02g';

        vm.editValuesEnabled = false;
        vm.updateButtonEnable = false; // To control when the update button could be enabled.

        // References to functions.
        vm.updateClass = updateClass;

        vm.showDeleteClassConfirm = showDeleteClassConfirm;
        vm.showDeleteStudentConfirm = showDeleteStudentConfirm;
        vm.showDeleteSubjectConfirm = showDeleteSubjectConfirm;
        vm.showDeleteTeacherFromSubjectConfirm = showDeleteTeacherFromSubjectConfirm;

        vm.loadStudents = loadStudents;
        vm.loadTeaching = loadTeaching;
        vm.loadReports = loadReports;

        vm.modValues = modValues;
        vm.cancelModValues = cancelModValues;


        vm.addRelation = addRelation;

        vm.associationIdSelected = null;


        vm.states = ('AL', 'AK');

        vm.classReport = null;
        activate();


        ///////////////////////////////////////////////////////////
        function activate() {
            console.log('Activating classesProfileController controller.')
            loadData();

        }

        /**
         * Load students
         */
        function loadStudents(associationId){

            console.log(associationId)

            if (!associationId) {

                vm.classStudents = ClassesService.getStudents({id: vm.classId},
                    function () {
                        console.log('Class Students');
                        console.log(vm.classStudents);
                    },
                    function (error) {
                        console.log('Get class students process fail.');
                        console.log(error);
                        toastService.showToast('Error obteniendo los alumnos inscritos a este grupo.');
                    }
                );
            }
            else{
                vm.classStudents = AssociationsService.getStudents({id: associationId},
                    function () {
                        console.log('Class Students');
                        console.log(vm.classStudents);
                    },
                    function (error) {
                        console.log('Get SUBJECT- class students process fail.');
                        console.log(error);
                        toastService.showToast('Error obteniendo los alumnos inscritos a este grupo.');
                    }
                );
            }
        }

        /**
         * Load only the teaching info about thsi class.
         */
        function loadTeaching() {
            vm.classTeaching = ClassesService.getTeaching({id: vm.classId},
                function () {
                    console.log('Class Teaching Data Block');
                    console.log(vm.classTeaching);
                    /*
                     // ### Do a copy to save process. ###
                     vm.classTeachingOriginalCopy = angular.copy(vm.classTeaching);

                     $scope.classTeachingModelHasChanged = false;

                     $scope.$watch('vm.classTeaching', function (newValue, oldValue) {
                     if (newValue != oldValue) {
                     $scope.classTeachingModelHasChanged = !angular.equals(vm.classTeaching, vm.classTeachingOriginalCopy);
                     }
                     compare()
                     }, true);
                     */

                }, function (error) {
                    console.log('Get class subjects process fail.');
                    console.log(error);
                    toastService.showToast('Error obteniendo las asignaturas que se imparten en la clase.')
                }
            );
        }

        function loadReports() {
            vm.classReport = ClassesService.getReport({id: vm.classId},
                function () {
                    console.log('Class Report Data Block');
                    console.log(vm.classReport);
                    if (!vm.classReport.report_log) {
                        vm.chartConfig['series'][0]['data'][0]['y'] = vm.classReport['students']['gender_percentage']['M']
                        vm.chartConfig['series'][0]['data'][1]['y'] = vm.classReport['students']['gender_percentage']['F'];
                        console.log(vm.chartConfig);
                    }

                }, function (error) {
                    console.log('Get class report process fail.');
                    console.log(error);
                    toastService.showToast('Error obteniendo las asignaturas que se imparten en la clase.')
                })
        }

        function loadData() {

            // Retrieve all data from this class
            vm.class = ClassesService.get({id: vm.classId}, function () {
                console.log(vm.class);

                // ### Do a copy to save process. ###
                vm.classOriginalCopy = angular.copy(vm.class);

                $scope.classModelHasChanged = false;

                $scope.$watch('vm.class', function (newValue, oldValue) {
                    console.log('Checking');
                    if (!angular.equals(vm.class.course, vm.classOriginalCopy.course)) {
                        vm.class.course = parseInt(vm.class.course);
                    }
                    $scope.classModelHasChanged = !angular.equals(vm.class, vm.classOriginalCopy);
                    if ($scope.classModelHasChanged)
                        vm.updateButtonEnable = true;
                    else
                        vm.updateButtonEnable = false;
                }, true);


            }, function (error) {
                console.log('Get class process fail.');
                console.log(error);
                vm.class = null;
            });





            loadTeaching();



        }


        function modValues() {
            vm.editValuesEnabled = true;
        }

        function cancelModValues() {
            vm.editValuesEnabled = false;

            vm.class = angular.copy(vm.classOriginalCopy);


        }

        /** Delete class in server.
         * Call to server with DELETE method ($delete= DELETE) using vm.class that is
         * a instance of ClassesService.*/
        function deleteClass() {

            ClassesService.delete({id: vm.classId},
                function () { // Success
                    console.log('Class deleted successfully.')
                    $state.go('classes')
                    toastService.showToast('Clase eliminada con éxito.')
                },
                function (error) { // Fail
                    console.log('Class deleted process fail.')
                    console.log(error)
                    toastService.showToast('Error eliminando la clase.')
                });

        }

        function deleteTeacherFromSubject(impartId) {

            ImpartsService.delete({id: impartId},
                function () { // Success
                    console.log('Class deleted successfully.');
                    loadTeaching(); // Reload the specific section.
                    toastService.showToast('Relación eliminada con éxito.')
                },
                function (error) { // Fail
                    console.log('Class deleted process fail.');
                    console.log(error)
                    toastService.showToast('Error eliminando la relación.')
                });

        }

        function showDeleteTeacherFromSubjectConfirm(impartId){
             var confirm = $mdDialog.confirm()
                .title('¿Está seguro de que quiere que este profesor deje de impartir la asingatura en esta clase?')
                .ok('Estoy seguro')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function () {
                deleteTeacherFromSubject(impartId);
            }, function () {
                console.log('Operacion cancelada.')
            });

        }

        function deleteSubjectFromClass(associationId){

            AssociationsService.delete({id: associationId},
                function () { // Success
                    loadTeaching(); // Reload the specific section.
                    toastService.showToast('Relación eliminada con éxito.')
                },
                function (error) { // Fail
                    console.log('Class deleted process fail.');
                    console.log(error)
                    toastService.showToast('Error eliminando la relación.')
                });

        }

        function showDeleteSubjectConfirm(associationId){
             var confirm = $mdDialog.confirm()
                .title('¿Está seguro de que quiere eliminar esta asignatura? Si lo hace, también eliminará las matrículas' +
                    'de los estudiantes matriculados a esta.')
                //.textContent('Si lo hace todos los alumnos quedarán ')
                //.ariaLabel('Lucky day')
                .ok('Estoy seguro')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function () {
                deleteSubjectFromClass(associationId);
            }, function () {
                console.log('Operacion cancelada.')
            });

        }

        function deleteStudentFromClass() {
            console.log('Deleting student from class.')
        }


        /** Show the previous step to delete item, a confirm message */
        function showDeleteClassConfirm() {

            var confirm = $mdDialog.confirm()
                .title('¿Está seguro de que quiere eliminar este grupo?')
                //.textContent('Si lo hace todos los alumnos quedarán ')
                //.ariaLabel('Lucky day')
                .ok('Estoy seguro')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function () {
                deleteClass();
            }, function () {
                console.log('Operacion cancelada.')
            });

        };

        /** Show the previous step to delete item, a confirm message */
        function showDeleteStudentConfirm() {


            var confirm = $mdDialog.confirm()
                .title('¿Está seguro de que quiere eliminar al estudiante de este grupo?')
                .ok('Estoy seguro')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function () {
                deleteStudentFromClass();
            }, function () {
                console.log('Operacion cancelada.')
            });

        };


        /** Update class data in server.
         * Call to server with PUT method ($update = PUT) using vm.class that is
         * a instance of ClassesService.*/
        function updateClass() {
            console.log('Calling updateClass() function.')
            vm.class.$update(
                function () { // Success
                    console.log('Class updated successfully.')
                    toastService.showToast('Clase actualizada con éxito.')
                    vm.editValuesEnabled = false;
                    vm.updateButtonEnable = false;
                },
                function (error) { // Fail
                    console.log('Error updating class.')
                    console.log(error)
                    toastService.showToast('Error actualizando la clase.')
                });
        }


        /*
         * Open the dialog to add a relation to this class.
         * The add action is done in addRelationController in addRelation.js
         */
        function addRelation(itemTypeToAdd, secondaryItem) {

            $mdDialog.show({
                locals: {
                    parentScope: $scope,
                    parentController: vm,
                    itemTypeToAdd: itemTypeToAdd,
                    secondaryItem: secondaryItem
                },
                // We use the same basic controller.
                controller: 'addRelationController',
                controllerAs: 'vm',
                templateUrl: 'app/views/teaching/utils/addRelationTemplate.html'
            })
                .then(function () {

                }, function () {

                });
        }

        vm.chartConfig = {
            xAxis: {
                type: 'category'
            },
            title: {
                text: 'Porcentaje por género.'
            },
            yAxis: {
                allowDecimals: false,
                title: {
                    text: 'Porcentaje'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
            },
            legend: {enabled: false},
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%'
                    }
                }
            },
            series: [{
                name: 'Genero',
                colorByPoint: true,
                type: 'column',
                data: [
                    {name: 'Chicos', y: 0},
                    {name: 'Chicas', y: 1}]
            }]
        };


    });

