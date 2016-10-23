angular.module('subjects')
    .controller('newSubjectDialogController',function($scope, $mdDialog, SubjectsService){

            var vm = this;

            activate();
            vm.closeDialog = closeDialog;
            vm.saveSubject = saveSubject

            vm.subject =  new SubjectsService();


            ///////////////////////////////////////////////////////////
            function activate() {
                console.log('Activating newSubjectDialogController controller.')
            }

            // Function to close the dialog
            function closeDialog() {
                $mdDialog.cancel();
            }

            function saveSubject(){
                console.log('Calling save subject function.')
                vm.subject.$save(function(){
                    console.log('Save successfully');
                    $mdDialog.cancel();
                });
            }

});