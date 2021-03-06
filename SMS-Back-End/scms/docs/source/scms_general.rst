**General Info**
========================

Imagen de la estructura

Imagen del modelo de la base de datos.

Domain
------------

This microservice make possible the control of attendance and discipline of the students in the system.
Using a database object oriented make very easy the data process and analysis, the core of the domain
of this service

Data base
----------

Is thinking to run with a Google Cloud Storage, connected with NDB library, but with this form is easy
to pass to another kind of database like MongoDB or something like this. The coplexity of this mService
is very low.

Data structures
---------------

This microService work with different kinds of data structures. We are take a look over there:

**ADB**  (*Association Data Block*)

Is the base of microservice, is the data structure that define the compound of the groups of students,
in some class, in some subject and with some teacher.

The api offers a simple CRUD methods to interact with this resource, to get, put, post and delete it.

The model of this data structure is:

.. code-block:: json

    association = {
        'association': {
            'associationId': 13,
            'class': {'classId': 283, 'classWord': 'A', 'classCourse': 2, 'classLevel': 'Elementary'},
            'subject': {'subjectId': 24, 'subjectName': 'Pruebas'}
        },
        'teacher': {'teacherId': 213,
                    'teacherName': 'asdk',
                    'teacherSurname': 'sdlkfjs',
                    'teacherImgProfile': 'www.google.es'},

        'students': [{'studentId': 213,
                      'studentName': 'asdk',
                      'studentSurname': 'sdlkfjs',
                      'studentImgProfile': 'www.google.es'},

                     {'studentId': 213,
                      'studentName': 'asdk',
                      'studentSurname': 'sdlkfjs',
                      'studentImgProfile': 'www.google.es'}
                     ]
    }




*The datatype are very important and must be right.

Metadata schema
--------------- 
 - This API Rest work only with JSON data format, to send data and to receive.
 - In spite of exists another tables in data model like *Impart*, *Association*, and *Enrollment* that represent different kinds of relations between entities this aren't accessible directly like nested resources from the API, but yes like unique. ::
 
        ../teacher/n/impart
        ...
        400 Bad Request
        ...


Code:

link to files