# -*- coding: utf-8 -*-

from fabric.api import local, lcd, run  # to run local commands.
from fabric.colors import red, blue
import time
import subprocess
from provisioner import example_data_provisioner

#####################################################################
# FABRIC Fabfile.  <http://www.fabfile.org/>
# This is the file to configure Fabric Python Library to admin tasks

# Use:
# fab <command>

# How to know the commands? :
# fab -l

# Info about command:
# fab -d <command>

#####################################################################

SMS_Back_End_default_port = '8001'  # api gateway microservice default port
SMS_Back_End_default_admin_port = '8083'

SMS_Front_End_default_port = '8080'  # Web default port
SMS_Front_End_default_admin_port = '8082'


def run_back_end(ms=None):
    """
    Running SMS Back-End
    """

    # Run only scms (Students Control micro Service)
    if ms == 'scms':
        local('google_appengine/dev_appserver.py' +
              ' --port=8003 --host=0.0.0.0 --admin_port=8083 ' +
              'SMS-Back-End/scms/scms.yaml &')
        pass

    if ms == None:


        print (red('### Running SMS Back-End in localhost in background. ###'))
        print (red('Please look at the list below to know the microservices ports.'))
        print (red('Note that default is apigms microservice.'))

        local('google_appengine/dev_appserver.py'
              ' --port=' + SMS_Back_End_default_port +
              ' --host=0.0.0.0 --admin_port=' + SMS_Back_End_default_admin_port +
              ' SMS-Back-End/apigms/apigms.yaml '
              'SMS-Back-End/tdbms/tdbms.yaml '
              'SMS-Back-End/scms/scms.yaml &')

        print (red('Thanks for your contribution!'))


def test(ms):
    """
    Tests task runner.
    Execute the test over specific microservice (part of it of over all) or over entire system.

    Examples:
        fab test:tdbms
        fab test:scms  -> Execute all test of this microservice.
        fab test:scms.api  -> Execute all test over the Api Rest
        fab test:scms.api.marks -> Execute all test over the Marks segment of API

    If something fail maybe it could be the pythonpath system.
    export PYTHONPATH="${PYTHONPATH}:/home/.../StudentsManagementSystem/SMS-Back-End/dbms/dbapi"

    """
    # All [[ Teaching Data Base microService ]].
    if ms == 'tdbms':
        print (blue('## Runnig Teaching Daba Base microService entire Test Suite. ## '))
        print (blue('## Runnig Teaching Daba Base microService dbapi library test. ## '))
        with lcd("SMS-Back-End/dbms/dbapi"):
            local("pytest test/ -vv")
        print (blue('## Runnig Teaching Daba Base microService apiRest test. ## '))
        with lcd("SMS-Back-End/dbms"):
            local("pytest test/ -vv")

    # Only the apiRest.
    if ms == 'tdbms.api':
        print (blue('## Runnig Teaching Daba Base microService apiRest test. ## '))
        with lcd("SMS-Back-End/dbms"):
            local("pytest test/ -vv")

    # It fail yet:
    if ms == 'tdbms.dbapi':
        print (blue('## Runnig Teaching Daba Base microService dbapi library test. ## '))
        with lcd("SMS-Back-End/dbms/dbapi"):
            local("pytest test/ -vv")

    #############################################################
    #                   SCmS Testing Options                    #
    #############################################################

    # To run all test of this micro Service (use: fab test:scms).
    if ms == 'scms':
        print (blue('## Runnig Students Control microService entire Test Suite. ## '))
        with lcd("SMS-Back-End/scms"):
            local("pytest test/ -vv")

    # To run test over auxiliary functions (use: fab test:scms.aux).
    if ms == 'scms.aux':
        print (blue('## Runnig Students Control microService API - aux functions TEST . ## '))
        with lcd("SMS-Back-End/scms"):
            local("pytest test/scms_aux_test.py -vv -s")

    # To run test over all scms.api (use: fab test:scms.api).
    if ms == 'scms.api':
        print (blue('## Runnig Students Control microService API  TEST . ## '))
        with lcd("SMS-Back-End/scms"):
            local("pytest test/scms_api_rest_associations_segment_test.py -vv -s")
            local("pytest test/scms_api_rest_marks_segment_test.py -vv -s")
            local("pytest test/scms_api_rest_disciplinary_notes_segment_test.py -vv -s")

    # To run test over scms.api associations segment (use: fab test:scms.api.associations).
    if ms == 'scms.api.attendancecontrols':
        print (blue('## Runnig Students Control microService API - Attendance Controls segment TEST . ## '))
        with lcd("SMS-Back-End/scms"):
            local("pytest test/scms_api_rest_attendance_controls_segment_test.py -vv -s")

    # To run test over scms.api marks segment (use: fab test:scms.api.marks).
    if ms == 'scms.api.marks':
        print (blue('## Runnig Students Control microService API - Mark segment TEST . ## '))
        with lcd("SMS-Back-End/scms"):
            local("pytest test/scms_api_rest_marks_segment_test.py -vv -s")

    # To run test over scms.api discipline notes segment (use: fab test:scms.api.disciplinarynotes).
    if ms == 'scms.api.disciplinarynotes':
        print (blue('## Runnig Students Control microService API - Disciplinary Notes segment TEST . ## '))
        with lcd("SMS-Back-End/scms"):
            local("pytest test/scms_api_rest_disciplinary_notes_segment_test.py -vv -s")


def doc(ms, open=False):
    """
    Doc generator.
    Build the documentation to the micro service passed. By default the html doc isn't open.

    Examples:
        fab doc:tdbms,open=yes
        fab doc:apigms
        fab doc:back-end
    """

    if ms in ['tdbms','scms','apigms']:
        local('make -C SMS-Back-End/{}/docs html'.format(ms))
        if open == 'yes':
            local('firefox SMS-Back-End/{}/docs/build/html/index.html'.format(ms))

    if ms == 'back-end':
        local('make -C SMS-Back-End/docs html')
        local('firefox SMS-Back-End/docs/build/html/index.html')


def clean():
    """
    Cleaner.
    Clean the system if decided leave the team. :(
    """

    print('Uninstalling unzip')
    subprocess.call(["sudo", "apt-get","--purge", "-y", "remove", "unzip"])
    print('Uninstalling curl')
    subprocess.call(["sudo", "apt-get", "--purge", "-y", "remove", "curl"])

    subprocess.call(["sudo", "apt-get","remove", "--purge", "mysql*"])
    subprocess.call(["sudo", "apt-get","autoremove"])
    subprocess.call(["sudo", "apt-get","autoclean"])

    for lib in ['tdbms', 'scms', 'ams']:
        subprocess.call(["rm", "-rf", "SMS-Back-End/"+lib])



def run_dbms_api_test():
    """
    Run dbms api test
    """
    local('pytest -s SMS-Back-End/dbms/test')


def run_apigms_api_test():
    """
    Run apigms api test
    """
    local('pytest -s SMS-Back-End/apigms/test')


def run_front_end():
    """
    Run SMS Front-End in local.
    """
    print (red('### Running SMS Front-End in localhost in background. ###'))
    print (red('Please look at the list below to know the microservice ports.'))

    local('google_appengine/dev_appserver.py '
          ' --port=' + SMS_Front_End_default_port +
          ' --host=0.0.0.0 --admin_port=' + SMS_Front_End_default_admin_port +
          ' SMS-Front-End/app.yaml &')

    print (red('Thanks for your contribution!'))


def run_mysql():
    """
    Start mysql daemon.
    """
    print (red('### Running MySQL daemon. ###'))
    local('sudo /etc/init.d/mysql start')


def data_provision(kind='Simple'):

    """
    Run the data provisioning procedure using the APIGmS.

    fab data_provision:kind='Simple'
    """

    if kind in ['Comlex', 'complex', 'C']:
        example_data_provisioner.run()  # Fill the system with example data.
    if kind in ['Simple', 'simple', 'S']:
        print 'yeah'


def requirements(ms=None):
    """
    Install all requirements for all or for some microservice.

    Example of use:
        fab requirements:ms=tdbms
        fab requirements # All system

    """

    def local_requirements():

        local('sudo chmod +x mysql_install.sh')
        local('sudo ./mysql_install.sh')

        commands = [
            'sudo apt-get install -y unzip',
            'sudo apt-get install -y curl',
            'sudo curl -O https://storage.googleapis.com/appengine-sdks/featured/google_appengine_1.9.30.zip',
            'sudo unzip google_appengine_1.9.30.zip',
            'sudo rm google_appengine_1.9.30.zip',
            'sudo curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-146.0.0-linux-x86_64.tar.gz',
            'tar -xvzf google-cloud-sdk-146.0.0-linux-x86_64.tar.gz',
            'sudo ./google-cloud-sdk/install.sh',
            'sudo rm google-cloud-sdk-146.0.0-linux-x86_64.tar.gz',
            'sudo apt-get install -y python-pip',
            'sudo apt-get install libmysqlclient-dev',
            'sudo pip install -r requirements.txt ',
            'mysql -u root -p\'root\' < SMS-Back-End/tdbms/dbapi/DBCreator.sql ',
            'sudo apt-get install nodejs',
            'sudo apt-get install npm',
            'sudo ln -s /usr/bin/nodejs /usr/bin/node',
            'sudo npm install -g bower'
            'sudo apt-get install python-sphinx'
        ]

        for command in commands:
            local(command)

    available_options = ['tdbms', 'apigms', 'scms', 'uims', 'local']
    if ms is not None:
        if ms in available_options:
            if ms in available_options[0:3]:
                path = 'SMS-Back-End/' + ms + '/'

                command = 'pip install -r ' + path + 'requirements.txt -t ' + path + 'lib/'
                local(command)

            if ms == 'uims':
                command = 'cd SMS-Front-End/app ; bower install'
                local(command)

            if ms == 'local':
                local_requirements()

        else:
            print ms + ' microservice doesn\'t exists.'
            print 'The avilable options are: ' + str(available_options)
            print 'Example of use: fab requirements:ms=dbms'

    # The user want to install ALL REQUIREMENTS of the project.
    else:

        # Welcome message
        print (blue('\n\t#############################################################'))
        print (blue('\t### Welcome to Students Managment System Develop Project! ###'))
        print (blue('\t#############################################################\n'))
        print (blue('We are going to install a lot of things that you need to work with it:'))

        raw_input(red('Do you want to continue? \nPress [ENTER] or \'Crtl+C\' to exit: '))

        print (blue('\nCool! \n'
                    'Please if any installation fails try to do this manually, to do this take a look to the '
                    'requirements() function of fabfile.py to see details. \nIn any software have been installed '
                    'already their step will be skipped.\n'))

        print (blue('##########################\n'
                    '## General requirements ##\n'
                    '##########################\n\n'
                    'Will be installed: \n'
                    '    MySQL Server'
                    '    curl'
                    '    unzip'
                    '    Google App Engine SDK v.1.9.30'
                    '    Google Cloud SDK v.146.0.0'
                    '    Python PIP'
                    '    NodeJS'
                    '    npm'
                    '    bower'))

        raw_input(red('Do you want to continue? \nPress [ENTER] or \'Crtl+C\' to exit: '))

        # Run local requirements.
        local_requirements()


        print (blue('\n#####################################\n'
                    '##  APIG microService Requirements ##\n'
                    '#####################################\n\n'
                    'Will be installed the dependencies related in SMS-Back-End/apigms/requirements.txt \n'))

        raw_input(red('Do you want to continue? \nPress [ENTER] or \'Crtl+C\' to exit: '))

        command = 'pip install -r SMS-Back-End/apigms/requirements.txt -t SMS-Back-End/apigms/lib/'
        local(command)

        print (blue('\n#####################################\n'
                    '## TDB microService Requirements   ##\n'
                    '#####################################\n\n'
                    'Will be installed the dependencies related in SMS-Back-End/tdbms/requirements.txt \n'))

        raw_input(red('Do you want to continue? \nPress [ENTER] or \'Crtl+C\' to exit: '))

        command = 'pip install -r SMS-Back-End/tdbms/requirements.txt -t SMS-Back-End/tdbms/lib/'
        local(command)

        print (blue('\n#####################################\n'
                    '##  SC microService Requirements   ##\n'
                    '#####################################\n\n'
                    'Will be installed the dependencies related in SMS-Back-End/scms/requirements.txt \n'))

        raw_input(red('Do you want to continue? \nPress [ENTER] or \'Crtl+C\' to exit: '))

        command = 'pip install -r SMS-Back-End/scms/requirements.txt -t SMS-Back-End/scms/lib/'
        local(command)

        print (blue('\n#######################################\n'
                    '##  UI microService web Requirements ##\n'
                    '#######################################\n\n'
                    'Will be installed the dependencies related in SMS-Front-End/app/bower.json \n'))

        raw_input(red('Do you want to continue? \nPress [ENTER] or \'Crtl+C\' to exit: '))
        command = 'cd SMS-Front-End/app ; bower install'
        local(command)


def run(provision=False, kind='Simple', run_test=False, test_section=None):
    """
    Run entire project, included MySQL daemon, SMS Front-End dev_server and Back-End dev_server.

    Example of use:
        fab run:provision=yes
    """

    run_mysql()  # Run database engine
    run_back_end()  # Run all microservices in Back End
    run_front_end()  # Run Front End
    time.sleep(5)

    if provision is True:
        data_provision(kind)

    # More complex run action, runing also specific tests:
    # Example:  fab run:run_test=yes,test_section=scms.api.marks

    if run_test and test_section:
        test(test_section)



def kill():
    """
    Kill all processes that is related with google dev servers.
    """
    print (red("Kill all processes that are related with google dev server."))
    #local("kill -9 $(ps -aux | grep google | awk '{ print $2 }' | head -n -1)")
    local("ps aux | grep appengine | grep -v grep | awk '{print $2}' | xargs kill")
