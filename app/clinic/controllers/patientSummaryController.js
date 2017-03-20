'use strict';

angular.module('clinic')
        .controller('PatientSummaryController', ["$scope", "$rootScope", "$stateParams",
                        "encounterService", "observationsService", "commonService", "orderService",
                    function ($scope, $rootScope, $stateParams, encounterService,
                    observationsService, commonService, orderService) {
        var patientUuid;

        (function () {
            patientUuid = $stateParams.patientUuid;
        })();

        $scope.initVisitHistory = function () {
            encounterService.getEncountersOfPatient(patientUuid).success(function (data) {
                $scope.visits = commonService.filterGroupReverse(data);
            });
        };

        $scope.initLabResults = function () {
            var labEncounterUuid = "e2790f68-1d5f-11e0-b929-000c29ad1d07";//TODO: create in configuration file

            encounterService.getEncountersForEncounterType(patientUuid, labEncounterUuid).success(function (data) {
                $scope.labs = commonService.filterGroupReverse(data);
            });
        };

        $scope.initDiagnosis = function () {
            var concepts = ["e1cdd38c-1d5f-11e0-b929-000c29ad1d07",
                "e1e2b07c-1d5f-11e0-b929-000c29ad1d07",
                "e1d608cc-1d5f-11e0-b929-000c29ad1d07",
                "e1e5232a-1d5f-11e0-b929-000c29ad1d07",
                "e1e529a6-1d5f-11e0-b929-000c29ad1d07",
                "e1d2984a-1d5f-11e0-b929-000c29ad1d07",
                "e1dac2ae-1d5f-11e0-b929-000c29ad1d07",
                "e1dac3da-1d5f-11e0-b929-000c29ad1d07",
                "e1dac574-1d5f-11e0-b929-000c29ad1d07",
                "e1e2530c-1d5f-11e0-b929-000c29ad1d07",
                "e1e52898-1d5f-11e0-b929-000c29ad1d07",
                "e1e29fa6-1d5f-11e0-b929-000c29ad1d07",
                "e1daf922-1d5f-11e0-b929-000c29ad1d07",
                "e1dce93a-1d5f-11e0-b929-000c29ad1d07"
            ];//TODO: create in configuration file

            observationsService.findAll(patientUuid).success (function (data) {
                var filtered = observationsService.filterByList(data.results, concepts);//TODO: filter must be dome in backend system
                var ordered = _.sortBy(filtered, function (obs) {
                    return obs.obsDatetime;
                });
                $scope.diagnosis = ordered;
            });
        };

        $scope.initICD10Diagnosis = function () {
            var concept = "e1eb7806-1d5f-11e0-b929-000c29ad1d07";//TODO: create in configuration file

            observationsService.get(patientUuid, concept).success (function (data) {
                var filtered = commonService.filterRetired(data.results);//TODO: filter must be dome in backend system
                $scope.icdDiagnosis = filtered;
            });
        };

        $scope.initPharmacyPickups = function () {
            var pharmacyEncounterUuid = "e279133c-1d5f-11e0-b929-000c29ad1d07";//TODO: create in configuration file

            encounterService.getEncountersForEncounterType(patientUuid, pharmacyEncounterUuid).success(function (data) {
                $scope.pickups = commonService.filterGroupReverse(data);
            });
        };

        $scope.initPharmacyPickupsNew = function () {
            var patientUuid = $stateParams.patientUuid;
            var pharmacyEncounterTypeUuid = "18fd49b7-6c2b-4604-88db-b3eb5b3a6d5f";

            encounterService.getEncountersForEncounterType(patientUuid, pharmacyEncounterTypeUuid).success(function (data) {
                var nonRetired = prepareDispenses(commonService.filterReverse(data));
                $scope.newPickups = nonRetired;

            });
        };

        var prepareDispenses = function (encounters) {

            var dispenses = [];

            _.forEach(encounters, function (encounter) {
                var dispense = {};
                dispense.detetime = encounter.encounterDatetime;
                dispense.provider = encounter.provider;
                dispense.items = [];
                _.forEach(encounter.obs, function (obs) {
                    var item = {};
                    item.order = obs.groupMembers[0].order;
                    item.quantity = commonService.findByMemberConcept(obs.groupMembers, "e1de2ca0-1d5f-11e0-b929-000c29ad1d07");
                    item.returnDate = commonService.findByMemberConcept(obs.groupMembers, "e1e2efd8-1d5f-11e0-b929-000c29ad1d07");

                    dispense.items.push(item);
                });
                dispenses.push(dispense);
            });

            return dispenses;
        };

        $scope.initPrescriptions = function () {
            var concepts = [Bahmni.Common.Constants.prescriptionConvSetConcept];

            var patient = $rootScope.patient;
            var adultFollowupEncounterUuid = Bahmni.Common.Constants.adultFollowupEncounterUuid;
            var childFollowupEncounterUuid = Bahmni.Common.Constants.childFollowupEncounterUuid;

            encounterService.getEncountersForEncounterType(patient.uuid,
            (patient.age.years >= 15) ? adultFollowupEncounterUuid : childFollowupEncounterUuid)
                    .success(function (data) {
                        var filteredResults = commonService.filterGroupReverseFollowupObs(concepts, data.results);
                        $scope.prescriptions = [];

                        _.forEach(filteredResults, function (filteredResult) {
                            var existingModels = {
                                prescriptionDate: filteredResult.encounterDatetime,
                                models: []
                            };

                            _.forEach(filteredResult.obs, function (pSet) {
                                var existingModel = angular.copy(Bahmni.Common.Constants.drugPrescriptionConvSet);
                                for (var key in existingModel) {
                                    var m = existingModel[key];
                                    var foundModel = _.find(pSet.groupMembers, function (element) {
                                        return element.concept.uuid === m.uuid;
                                    });
                                    if (_.isUndefined(foundModel)) continue;

                                    if (key === "otherDrugs") {
                                        if (_.includes(Bahmni.Common.Constants.prophilaxyDrugConcepts, foundModel.value.uuid)) {
                                            continue;
                                        }
                                    }
                                    if (key === "prophilaxyDrugs") {
                                        if (!_.includes(Bahmni.Common.Constants.prophilaxyDrugConcepts, foundModel.value.uuid)) {
                                            continue;
                                        }
                                    }

                                    m.model = foundModel.concept;
                                    m.value = foundModel.value;
                                }
                                existingModels.models.push(existingModel);
                            });
                            $scope.prescriptions.push(existingModels);
                        });
                    });
        };

        $scope.initAllergies = function () {
            var concepts = ["e1e07ece-1d5f-11e0-b929-000c29ad1d07", "e1da757e-1d5f-11e0-b929-000c29ad1d07"];

            var adultFollowupEncounterUuid = "e278f956-1d5f-11e0-b929-000c29ad1d07";//TODO: create in configuration file
            var childFollowupEncounterUuid = "e278fce4-1d5f-11e0-b929-000c29ad1d07";//TODO: create in configuration file

            var patient = commonService.deferPatient($rootScope.patient);

            encounterService.getEncountersForEncounterType(patient.uuid,
            (patient.age.years >= 15) ? adultFollowupEncounterUuid : childFollowupEncounterUuid)
                    .success(function (data) {
                        $scope.allergies = commonService.filterGroupReverseFollowupObs(concepts, data.results);

            });
        };

        $scope.initVitals = function () {
            var concepts = ["e1e2e934-1d5f-11e0-b929-000c29ad1d07",
                "e1e2e826-1d5f-11e0-b929-000c29ad1d07",
                "e1da52ba-1d5f-11e0-b929-000c29ad1d07",
                "e1e2e70e-1d5f-11e0-b929-000c29ad1d07",
                "e1e2e3d0-1d5f-11e0-b929-000c29ad1d07"
            ];//TODO: create in configuration file

            var adultFollowupEncounterUuid = "e278f956-1d5f-11e0-b929-000c29ad1d07";//TODO: create in configuration file
            var childFollowupEncounterUuid = "e278fce4-1d5f-11e0-b929-000c29ad1d07";//TODO: create in configuration file

            var patient = commonService.deferPatient($rootScope.patient);

            encounterService.getEncountersForEncounterType(patient.uuid,
            (patient.age.years >= 15) ? adultFollowupEncounterUuid : childFollowupEncounterUuid)
                    .success(function (data) {
                        $scope.vitals = commonService.filterGroupReverseFollowupObs(concepts, data.results);

            });
        };

        $scope.isObject = function (value) {
            return _.isObject(value);
        };

    }]);
