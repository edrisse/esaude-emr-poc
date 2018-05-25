(function () {
  'use strict';

  angular
    .module('registration')
    .config(config);

  config.$inject = ['$urlRouterProvider', '$stateProvider', '$bahmniTranslateProvider', '$httpProvider'];

  /* @ngInject */
  function config ($urlRouterProvider, $stateProvider, $bahmniTranslateProvider, $httpProvider) {

    // to prevent the browser from displaying a password pop-up in case of an authentication error
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = 'true';

    $urlRouterProvider.otherwise(function ($injector) {
      $injector.get('$state').go('search');
    });

    $bahmniTranslateProvider.init({app: 'registration', shouldMerge: true});

    $stateProvider
      .state('search', {
        url: '/search',
        component: 'patientSearch',
        resolve: {
          initialization: 'initialization',
          showSchedule: function () { return true },
          createPatient: function () { return true },
        },
        ncyBreadcrumb: {
          label: '{{\'APP_REGISTRATION\' | translate}} /  {{\'SEARCH_PATIENT\' | translate}}'
        }
      })
      .state('dashboard', {
        url: '/dashboard/:patientUuid',
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardController',
        controllerAs: 'vm',
        resolve: {
          initialization: 'initialization'
        },
        ncyBreadcrumb: {
          label: '{{ \'COMMON_DASHBOARD\' | translate}}',
          parent: 'search'
        }
      })
      .state('dashboard.program', {
        url: '/program',
        templateUrl: '../common/uicontrols/programmanagement/views/patient-programs.html',
        controller: 'ManageProgramController',
        ncyBreadcrumb: {
          label: '{{\'COMMON_PROGRAM_ENROLLMENT_TITLE\' | translate}}',
          parent: 'dashboard',
          skip: true
        }
      })
      .state('dashboard.visits', {
        url: '/visits',
        templateUrl: 'views/patient-visits.html',
        controller: 'VisitHistoryController',
        controllerAs: 'vm',
        ncyBreadcrumb: {
          label: '{{\'COMMON_VISIT_HISTORY_TITLE\' | translate}}',
          parent: 'dashboard',
          skip: true
        }
      })
      .state('dashboard.services', {
        url: '/services',
        templateUrl: 'views/patient-services.html',
        controller: 'ClinicalServicesController',
        controllerAs: 'vm',
        ncyBreadcrumb: {
          label: '{{\'COMMON_CLINIC_SERVICES_TITLE\' | translate}}',
          parent: 'dashboard',
          skip: true
        },
        resolve: {
          clinicalServicesService: function (clinicalServicesService, $stateParams) {
            return clinicalServicesService.init('registration', $stateParams.patientUuid);
          }
        }
      })
      .state('newpatient', {
        url: '/patient/new',
        templateUrl: 'views/patient-add.html',
        controller: 'CreatePatientController',
        ncyBreadcrumb: {
          label: '{{\'PATIENT_INFO_NEW\' | translate}}',
          parent: 'search'
        }
      })
      .state('newpatient.name', {
        url: '/name',
        templateUrl: 'views/patient-name-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('newpatient.gender', {
        url: '/gender',
        templateUrl: 'views/patient-gender-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('newpatient.age', {
        url: '/age',
        templateUrl: 'views/patient-age-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('newpatient.address', {
        url: '/address',
        templateUrl: 'views/patient-address-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('newpatient.other', {
        url: '/other',
        templateUrl: 'views/patient-other-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('newpatient.identifier', {
        url: '/identifier',
        templateUrl: 'views/patient-identifier-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('newpatient.testing', {
        url: '/death',
        templateUrl: 'views/patient-hiv-test-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('newpatient.confirm', {
        url: '/confirm',
        templateUrl: 'views/patient-confirm-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('editpatient', {
        url: '/patient/edit/:patientUuid',
        templateUrl: 'views/patient-add.html',
        controller: 'UpdatePatientController',
        ncyBreadcrumb: {
          label: '{{\'EDIT_PATIENT\' | translate }}',
          parent: 'dashboard'
        },
        params: {
          returnState: null
        },
        resolve: {
          patient: function (initialization, $stateParams, patientService) {
            // We need initialization to always resolve first
            var representation = "custom:(uuid,voided,display,person:full,identifiers:(uuid,display,identifier,location,preferred,voided,identifierType:full))";
            return patientService.getPatient($stateParams.patientUuid, representation);
          }
        }
      })
      .state('editpatient.name', {
        url: '/name',
        templateUrl: 'views/patient-name-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('editpatient.gender', {
        url: '/gender',
        templateUrl: 'views/patient-gender-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('editpatient.age', {
        url: '/age',
        templateUrl: 'views/patient-age-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('editpatient.address', {
        url: '/address',
        templateUrl: 'views/patient-address-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('editpatient.other', {
        url: '/other',
        templateUrl: 'views/patient-other-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('editpatient.identifier', {
        url: '/identifier',
        templateUrl: 'views/patient-identifier-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('editpatient.testing', {
        url: '/death',
        templateUrl: 'views/patient-hiv-test-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('editpatient.confirm', {
        url: '/confirm',
        templateUrl: 'views/patient-confirm-input.html',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('detailpatient', {
        url: '/patient/detail/:patientUuid',
        templateUrl: '../patient-details/views/patient-details.html',
        controller: 'DetailPatientController',
        controllerAs: 'patientCommon',
        ncyBreadcrumb: {
          label: '{{\'PATIENT_DETAILS\' | translate }}',
          parent: 'dashboard'
        },
        params: {
          returnState: null
        },
        resolve: {
          initialization: 'initialization'
        }
      });
  }
})();
