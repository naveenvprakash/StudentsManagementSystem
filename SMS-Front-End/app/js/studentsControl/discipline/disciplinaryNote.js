angular.module('discipline')
    .controller('disciplinaryNoteController', function ($scope, moment, $q, $resource, $state, $stateParams, $mdDialog, toastService, globalService, DisciplineService) {

            var vm = this;

            // Param url passed to load an existing disciplinary note
            vm.disciplinaryNoteId = $stateParams.disciplinaryNoteId;

            console.log('disciplinaryNoteId')
            console.log(vm.disciplinaryNoteId)

            vm.action = null;

            if (vm.associationId)
                vm.action = 'new';
            else
                vm.action = 'loaded';
            console.log(vm.action);

            vm.defaultAvatar = globalService.defaultAvatar;

            // Functions:
            vm.changeAssistanceForStudent = changeAssistanceForStudent;
            vm.changeUniformForStudent = changeUniformForStudent;
            vm.checkIfDelayIsEnabled = checkIfDelayIsEnabled;
            vm.checkIfJustifiedDelayIsEnabled = checkIfJustifiedDelayIsEnabled;

            // To control the loading spinner.
            vm.dataIsReady = false;

            vm.delayList = ['5', '10', '15', '20', '30', '45'];

            activate();


            ///////////////////////////////////////////////////////////////////
            function activate() {
                console.log('Activating attendanceControlController controller.');

                    vm.dn = DisciplineService.get({id: vm.disciplinaryNoteId},
                        function () {
                            console.log('Disciplinary Note Data Block received:');
                            console.log(vm.dn);
                            vm.dataIsReady = true;

                        }, function (error) {
                            console.log('Get disciplinary note process fail.');
                            console.log(error);
                            toastService.showToast('Error obteniendo el parte disciplinario.')
                        })
            }


            function checkIfDelayIsEnabled(delayValue) {
                if (delayValue == null)
                    return false;
                else
                    return true;
            }

            function checkIfJustifiedDelayIsEnabled(delayValue) {
              if (delayValue == null)
                    return false;
              else
                    return true;
            }


            vm.changeDelay = function changeDelay(studentId, delay){

                 if (delay == 'Sin retraso'){
                     delay = 0;
                 }
                 for (var a = 0; a < vm.acBase.students.length; a++) {
                    if (vm.acBase.students[a].studentId == studentId) {
                            vm.acBase.students[a].control.delay = delay;
                            console.log(vm.acBase.students[a].control.delay);
                            if (delay !=0)
                                vm.acBase.students[a].control.justifiedDelay = 0;
                            else
                                vm.acBase.students[a].control.justifiedDelay = null;
                    }
                }
            }

            vm.changeJustifiedDelay = function changeJustifiedDelay(studentId){
                for (var a = 0; a < vm.acBase.students.length; a++) {
                    if (vm.acBase.students[a].studentId == studentId) {
                        if (vm.acBase.students[a].control.justifiedDelay == true) {
                            vm.acBase.students[a].control.justifiedDelay = false;
                        } else {
                            vm.acBase.students[a].control.justifiedDelay = true;
                        }
                    }
                }
            }

            function changeUniformForStudent(studentId) {
                for (var a = 0; a < vm.acBase.students.length; a++) {
                    if (vm.acBase.students[a].studentId == studentId) {
                        if (vm.acBase.students[a].control.uniform == true) {
                            vm.acBase.students[a].control.uniform = false;
                        } else {
                            vm.acBase.students[a].control.uniform = true;
                        }
                    }
                }
            }

            function changeAssistanceForStudent(studentId) {

                for (var a = 0; a < vm.acBase.students.length; a++) {
                    if (vm.acBase.students[a].studentId == studentId) {
                        if (vm.acBase.students[a].control.assistance == true) {

                            // Set the student to fault.
                            vm.acBase.students[a].control.assistance = false;
                            // It changed to null the rest of values:
                            vm.acBase.students[a].control.delay = null;
                            vm.acBase.students[a].control.justifiedDelay = false;
                            vm.acBase.students[a].control.uniform = null;

                            console.log(vm.acBase.students[a].control);


                        } else {
                            vm.acBase.students[a].control.assistance = true;
                            vm.acBase.students[a].control.delay = 0;
                            vm.acBase.students[a].control.justifiedDelay = null;
                            vm.acBase.students[a].control.uniform = true;
                        }
                    }
                }

            }

            vm.saveCA = function saveCA(){

                console.log('Saving CA');
                console.log(vm.acBase);

                vm.acBase.$save(
                    function(){ // Success
                        console.log('ac saved successfully');
                        $state.go('attendanceControls');
                        toastService.showToast('Control de asistencia realizado con éxito.');
                    },
                    function(error){ // Fail
                        toastService.showToast('Error al enviar control de asistencia.');
                        console.log('Error while ac was saved.');
                        console.log(error);
                    });
            }

        }
    )