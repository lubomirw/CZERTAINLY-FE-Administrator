import AttributeViewer from "components/Attributes/AttributeViewer";
import CustomTable, { TableDataRow, TableHeader } from "components/CustomTable";
import Dialog from "components/Dialog";
import ProgressButton from "components/ProgressButton";
import StatusBadge from "components/StatusBadge";

import Widget from "components/Widget";
import WidgetButtons, { WidgetButtonProps } from "components/WidgetButtons";

import { actions as raProfilesActions, selectors as raProfilesSelectors } from "ducks/ra-profiles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link, useParams } from "react-router-dom";

import { Col, Container, Label, Row } from "reactstrap";
import { Resource } from "../../../../types/openapi";
import CustomAttributeWidget from "../../../Attributes/CustomAttributeWidget";

import AssociateComplianceProfileDialogBody from "../AssociateComplianceProfileDialogBody";
import ProtocolActivationDialogBody, { Protocol } from "../ProtocolActivationDialogBody";

export default function RaProfileDetail() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id, authorityId } = useParams();

    const raProfile = useSelector(raProfilesSelectors.raProfile);
    const acmeDetails = useSelector(raProfilesSelectors.acmeDetails);
    const scepDetails = useSelector(raProfilesSelectors.scepDetails);
    const associatedComplianceProfiles = useSelector(raProfilesSelectors.associatedComplianceProfiles);

    const isFetchingProfile = useSelector(raProfilesSelectors.isFetchingDetail);
    const isFetchingAcmeDetails = useSelector(raProfilesSelectors.isFetchingAcmeDetails);
    const isFetchingScepDetails = useSelector(raProfilesSelectors.isFetchingScepDetails);

    const isDeleting = useSelector(raProfilesSelectors.isDeleting);
    const isEnabling = useSelector(raProfilesSelectors.isEnabling);
    const isDisabling = useSelector(raProfilesSelectors.isDisabling);
    const isActivatingAcme = useSelector(raProfilesSelectors.isActivatingAcme);
    const isDeactivatingAcme = useSelector(raProfilesSelectors.isDeactivatingAcme);
    const isActivatingScep = useSelector(raProfilesSelectors.isActivatingScep);
    const isDeactivatingScep = useSelector(raProfilesSelectors.isDeactivatingScep);
    const isFetchingAssociatedComplianceProfiles = useSelector(raProfilesSelectors.isFetchingAssociatedComplianceProfiles);

    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

    const [activateAcmeDialog, setActivateAcmeDialog] = useState(false);
    const [activateScepDialog, setActivateScepDialog] = useState(false);

    const [confirmDeactivateAcme, setConfirmDeactivateAcme] = useState<boolean>(false);
    const [confirmDeactivateScep, setConfirmDeactivateScep] = useState<boolean>(false);

    const [complianceCheck, setComplianceCheck] = useState<boolean>(false);

    const [associateComplianceProfile, setAssociateComplianceProfile] = useState<boolean>(false);

    const isBusy = useMemo(
        () => isFetchingProfile || isDeleting || isEnabling || isDisabling,
        [isFetchingProfile, isDeleting, isEnabling, isDisabling],
    );

    const isWorkingWithProtocol = useMemo(
        () =>
            isActivatingAcme ||
            isDeactivatingAcme ||
            isFetchingAcmeDetails ||
            isActivatingScep ||
            isDeactivatingScep ||
            isFetchingScepDetails,
        [isActivatingAcme, isDeactivatingAcme, isFetchingAcmeDetails, isActivatingScep, isDeactivatingScep, isFetchingScepDetails],
    );

    useEffect(() => {
        if (!id || !authorityId) return;

        dispatch(raProfilesActions.getRaProfileDetail({ authorityUuid: authorityId, uuid: id }));

        if (authorityId === "unknown" || authorityId === "undefined") return;

        dispatch(raProfilesActions.getComplianceProfilesForRaProfile({ authorityUuid: authorityId, uuid: id }));
        dispatch(raProfilesActions.listIssuanceAttributeDescriptors({ authorityUuid: authorityId, uuid: id }));
        dispatch(raProfilesActions.listRevocationAttributeDescriptors({ authorityUuid: authorityId, uuid: id }));
        dispatch(raProfilesActions.getAcmeDetails({ authorityUuid: authorityId, uuid: id }));
        dispatch(raProfilesActions.getScepDetails({ authorityUuid: authorityId, uuid: id }));
    }, [id, dispatch, authorityId]);

    const onEditClick = useCallback(() => {
        if (!raProfile) return;
        navigate(`../../../edit/${raProfile.authorityInstanceUuid}/${raProfile?.uuid}`, { relative: "path" });
    }, [navigate, raProfile]);

    const onEnableClick = useCallback(() => {
        if (!raProfile) return;
        dispatch(raProfilesActions.enableRaProfile({ authorityUuid: raProfile.authorityInstanceUuid, uuid: raProfile.uuid }));
    }, [dispatch, raProfile]);

    const onDisableClick = useCallback(() => {
        if (!raProfile) return;
        dispatch(raProfilesActions.disableRaProfile({ authorityUuid: raProfile.authorityInstanceUuid, uuid: raProfile.uuid }));
    }, [dispatch, raProfile]);

    const onDeleteConfirmed = useCallback(() => {
        if (!raProfile) return;
        dispatch(
            raProfilesActions.deleteRaProfile({
                authorityUuid: raProfile.authorityInstanceUuid || "unknown",
                uuid: raProfile.uuid,
                redirect: "../../../",
            }),
        );
        setConfirmDelete(false);
    }, [dispatch, raProfile]);

    const onDeactivateAcmeConfirmed = useCallback(() => {
        if (!raProfile) return;
        dispatch(raProfilesActions.deactivateAcme({ authorityUuid: raProfile.authorityInstanceUuid, uuid: raProfile.uuid }));
        setConfirmDeactivateAcme(false);
    }, [dispatch, raProfile]);

    const openAcmeActivationDialog = useCallback(() => {
        setActivateAcmeDialog(true);
    }, []);

    const onDeactivateScepConfirmed = useCallback(() => {
        if (!raProfile) return;
        dispatch(raProfilesActions.deactivateScep({ authorityUuid: raProfile.authorityInstanceUuid, uuid: raProfile.uuid }));
        setConfirmDeactivateScep(false);
    }, [dispatch, raProfile]);

    const openScepActivationDialog = useCallback(() => {
        setActivateScepDialog(true);
    }, []);

    const onComplianceCheck = useCallback(() => {
        setComplianceCheck(false);

        if (!raProfile?.uuid) return;

        dispatch(raProfilesActions.checkCompliance({ uuids: [raProfile.uuid] }));
    }, [dispatch, raProfile]);

    const onDissociateComplianceProfile = useCallback(
        (uuid: string) => {
            if (!raProfile) return;

            dispatch(
                raProfilesActions.dissociateRaProfile({ uuid: raProfile.uuid, complianceProfileUuid: uuid, complianceProfileName: "" }),
            );
        },
        [raProfile, dispatch],
    );

    const buttons: WidgetButtonProps[] = useMemo(
        () => [
            {
                icon: "pencil",
                disabled: false,
                tooltip: "Edit",
                onClick: () => {
                    onEditClick();
                },
            },
            {
                icon: "trash",
                disabled: false,
                tooltip: "Delete",
                onClick: () => {
                    setConfirmDelete(true);
                },
            },
            {
                icon: "check",
                disabled: !raProfile?.authorityInstanceUuid || raProfile?.enabled || false,
                tooltip: "Enable",
                onClick: () => {
                    onEnableClick();
                },
            },
            {
                icon: "times",
                disabled: !raProfile?.authorityInstanceUuid || !(raProfile?.enabled || false),
                tooltip: "Disable",
                onClick: () => {
                    onDisableClick();
                },
            },
            {
                icon: "gavel",
                disabled: !raProfile?.authorityInstanceUuid || false,
                tooltip: "Check Compliance",
                onClick: () => {
                    setComplianceCheck(true);
                },
            },
        ],
        [raProfile, onEditClick, onDisableClick, onEnableClick],
    );

    const raProfileTitle = useMemo(
        () => (
            <div>
                <div className="fa-pull-right mt-n-xs">
                    <WidgetButtons buttons={buttons} />
                </div>

                <h5>
                    RA Profile <span className="fw-semi-bold">Details</span>
                </h5>
            </div>
        ),
        [buttons],
    );

    const complianceProfileButtons: WidgetButtonProps[] = useMemo(
        () => [
            {
                icon: "plus",
                disabled: false,
                tooltip: "Associate Compliance Profile",
                onClick: () => {
                    setAssociateComplianceProfile(true);
                },
            },
        ],
        [],
    );

    const complianceProfileHeaders: TableHeader[] = useMemo(
        () => [
            {
                id: "complianceProfileName",
                content: "Name",
            },
            {
                id: "description",
                content: "Description",
            },
            {
                id: "action",
                content: "Action",
            },
        ],
        [],
    );

    const complianceProfileData: TableDataRow[] = useMemo(
        () =>
            !associatedComplianceProfiles
                ? []
                : (associatedComplianceProfiles || []).map((profile) => ({
                      id: profile.uuid,
                      columns: [
                          <Link to={`../../../complianceprofiles/detail/${profile!.uuid}`}>{profile!.name}</Link>,

                          profile.description || "",

                          <WidgetButtons
                              buttons={[
                                  {
                                      icon: "minus-square",
                                      disabled: false,
                                      tooltip: "Remove",
                                      onClick: () => {
                                          onDissociateComplianceProfile(profile.uuid);
                                      },
                                      id: "ra" + profile.uuid,
                                  },
                              ]}
                          />,
                      ],
                  })),
        [associatedComplianceProfiles, onDissociateComplianceProfile],
    );

    const complianceProfileTitle = useMemo(
        () => (
            <div>
                <div className="fa-pull-right mt-n-xs">
                    <WidgetButtons buttons={complianceProfileButtons} />
                </div>

                <h5>
                    <span className="fw-semi-bold">Compliance Profiles</span>
                </h5>
            </div>
        ),
        [complianceProfileButtons],
    );

    const detailHeaders: TableHeader[] = useMemo(
        () => [
            {
                id: "property",
                content: "Property",
            },
            {
                id: "value",
                content: "Value",
            },
        ],
        [],
    );

    const detailData: TableDataRow[] = useMemo(
        () =>
            !raProfile
                ? []
                : [
                      {
                          id: "uuid",
                          columns: ["UUID", raProfile.uuid],
                      },
                      {
                          id: "name",
                          columns: ["Name", raProfile.name],
                      },
                      {
                          id: "description",
                          columns: ["Description", raProfile.description || ""],
                      },
                      {
                          id: "enabled",
                          columns: ["Enabled", <StatusBadge enabled={raProfile!.enabled} />],
                      },
                      {
                          id: "authorityUuid",
                          columns: ["Authority Instance UUID", raProfile.authorityInstanceUuid],
                      },
                      {
                          id: "authorityName",
                          columns: [
                              "Authority Instance Name",
                              raProfile.authorityInstanceUuid ? (
                                  <Link to={`../../authorities/detail/${raProfile.authorityInstanceUuid}`}>
                                      {raProfile.authorityInstanceName}
                                  </Link>
                              ) : (
                                  ""
                              ),
                          ],
                      },
                  ],
        [raProfile],
    );

    const protocolProfileHeaders: TableHeader[] = useMemo(
        () => [
            {
                id: "property",
                content: "",
            },
            {
                id: "value",
                content: "",
            },
        ],
        [],
    );

    const acmeProfileData: TableDataRow[] = useMemo(
        () =>
            !acmeDetails
                ? []
                : [
                      {
                          id: "uuid",
                          columns: ["UUID", acmeDetails.uuid || ""],
                      },
                      {
                          id: "name",
                          columns: ["Name", acmeDetails.name || ""],
                      },
                      {
                          id: "Directory URL",
                          columns: ["Directory URL", acmeDetails.directoryUrl || ""],
                      },
                  ],
        [acmeDetails],
    );

    const scepProfileData: TableDataRow[] = useMemo(
        () =>
            !scepDetails
                ? []
                : [
                      {
                          id: "uuid",
                          columns: ["UUID", scepDetails.uuid || ""],
                      },
                      {
                          id: "name",
                          columns: ["Name", scepDetails.name || ""],
                      },
                      {
                          id: "URL",
                          columns: ["URL", scepDetails.url || ""],
                      },
                  ],
        [scepDetails],
    );

    const availableProtocolsHeaders: TableHeader[] = useMemo(
        () => [
            {
                id: "name",
                content: "Protocol name",
                sortable: true,
                width: "10%",
                sort: "asc",
            },
            {
                id: "status",
                content: "Status",
                sortable: true,
                align: "center",
                width: "10%",
            },
            {
                id: "actions",
                content: "Actions",
                align: "center",
                width: "10%",
            },
        ],
        [],
    );

    const availableProtocolsData: TableDataRow[] = useMemo(
        () => [
            {
                id: "acme",
                columns: [
                    "ACME",
                    <StatusBadge enabled={acmeDetails ? (acmeDetails.acmeAvailable ? true : false) : false} />,
                    <ProgressButton
                        className="btn btn-primary btn-sm"
                        type="button"
                        title={acmeDetails?.acmeAvailable ? "Deactivate" : "Activate"}
                        inProgressTitle={acmeDetails?.acmeAvailable ? "Deactivating..." : "Activating..."}
                        inProgress={isActivatingAcme || isDeactivatingAcme}
                        onClick={() => (acmeDetails?.acmeAvailable ? setConfirmDeactivateAcme(true) : openAcmeActivationDialog())}
                    />,
                ],
                detailColumns: [
                    <></>,
                    <></>,
                    <></>,

                    !acmeDetails || !acmeDetails.acmeAvailable ? (
                        <>ACME is not active</>
                    ) : (
                        <>
                            <b>Protocol settings</b>
                            <br />
                            <br />
                            <CustomTable hasHeader={false} headers={protocolProfileHeaders} data={acmeProfileData} />

                            {acmeDetails && acmeDetails.issueCertificateAttributes && acmeDetails.issueCertificateAttributes.length > 0 ? (
                                <>
                                    <b>Settings for certificate issuing</b>
                                    <br />
                                    <br />
                                    <AttributeViewer hasHeader={false} attributes={acmeDetails?.issueCertificateAttributes} />
                                </>
                            ) : (
                                <></>
                            )}

                            {acmeDetails &&
                            acmeDetails.revokeCertificateAttributes &&
                            acmeDetails.revokeCertificateAttributes.length > 0 ? (
                                <>
                                    <b>Settings for certificate revocation</b>
                                    <br />
                                    <br />
                                    <AttributeViewer hasHeader={false} attributes={acmeDetails?.revokeCertificateAttributes} />
                                </>
                            ) : (
                                <></>
                            )}
                        </>
                    ),
                ],
            },
            {
                id: "scep",
                columns: [
                    "SCEP",
                    <StatusBadge enabled={scepDetails ? (scepDetails.scepAvailable ? true : false) : false} />,
                    <ProgressButton
                        className="btn btn-primary btn-sm"
                        type="button"
                        title={scepDetails?.scepAvailable ? "Deactivate" : "Activate"}
                        inProgressTitle={scepDetails?.scepAvailable ? "Deactivating..." : "Activating..."}
                        inProgress={isActivatingScep || isDeactivatingScep}
                        onClick={() => (scepDetails?.scepAvailable ? setConfirmDeactivateScep(true) : openScepActivationDialog())}
                    />,
                ],
                detailColumns: [
                    <></>,
                    <></>,
                    <></>,

                    !scepDetails || !scepDetails.scepAvailable ? (
                        <>SCEP is not active</>
                    ) : (
                        <>
                            <b>Protocol settings</b>
                            <br />
                            <br />
                            <CustomTable hasHeader={false} headers={protocolProfileHeaders} data={scepProfileData} />

                            {scepDetails && scepDetails.issueCertificateAttributes && scepDetails.issueCertificateAttributes.length > 0 ? (
                                <>
                                    <b>Settings for certificate issuing</b>
                                    <br />
                                    <br />
                                    <AttributeViewer hasHeader={false} attributes={scepDetails?.issueCertificateAttributes} />
                                </>
                            ) : (
                                <></>
                            )}
                        </>
                    ),
                ],
            },
        ],
        [
            acmeDetails,
            scepDetails,
            isActivatingAcme,
            isDeactivatingAcme,
            isActivatingScep,
            isDeactivatingScep,
            protocolProfileHeaders,
            acmeProfileData,
            scepProfileData,
            openAcmeActivationDialog,
            openScepActivationDialog,
        ],
    );

    return (
        <Container className="themed-container" fluid>
            <Row xs="1" sm="1" md="2" lg="2" xl="2">
                <Col>
                    <Widget title={raProfileTitle} busy={isBusy}>
                        <br />

                        <CustomTable headers={detailHeaders} data={detailData} />
                    </Widget>

                    <Widget title={complianceProfileTitle} busy={isFetchingAssociatedComplianceProfiles}>
                        <CustomTable headers={complianceProfileHeaders} data={complianceProfileData} />
                    </Widget>
                </Col>

                <Col>
                    <Widget title="Attributes" busy={isBusy}>
                        {!raProfile || !raProfile.attributes || raProfile.attributes.length === 0 ? (
                            <></>
                        ) : (
                            <>
                                <br />
                                <Label>RA profile Attributes</Label>
                                <AttributeViewer attributes={raProfile?.attributes} />
                            </>
                        )}
                    </Widget>

                    {raProfile && (
                        <CustomAttributeWidget
                            resource={Resource.RaProfiles}
                            resourceUuid={raProfile.uuid}
                            attributes={raProfile.customAttributes}
                        />
                    )}
                </Col>
            </Row>

            <Row xs="1" sm="1" md="2" lg="2" xl="2">
                <Col></Col>
            </Row>

            <Widget title="Available protocols" busy={isBusy || isWorkingWithProtocol}>
                <br />

                <CustomTable hasDetails={true} headers={availableProtocolsHeaders} data={availableProtocolsData} />
            </Widget>

            <Dialog
                isOpen={confirmDelete}
                caption="Delete RA Profile"
                body="You are about to delete RA Profiles which may have existing
                  authorizations from clients. If you continue, these authorizations
                  will be deleted as well. Is this what you want to do?"
                toggle={() => setConfirmDelete(false)}
                buttons={[
                    { color: "danger", onClick: onDeleteConfirmed, body: "Yes, delete" },
                    { color: "secondary", onClick: () => setConfirmDelete(false), body: "Cancel" },
                ]}
            />

            <Dialog
                isOpen={associateComplianceProfile}
                caption="Associate Compliance Profile"
                body={AssociateComplianceProfileDialogBody({
                    visible: associateComplianceProfile,
                    onClose: () => setAssociateComplianceProfile(false),
                    raProfile: raProfile,
                    availableComplianceProfileUuids: associatedComplianceProfiles.map((e) => e.uuid),
                })}
                toggle={() => setAssociateComplianceProfile(false)}
                buttons={[]}
            />

            <Dialog
                isOpen={confirmDeactivateAcme}
                caption="Deactivate ACME"
                body="You are about to deactivate ACME protocol for the RA profile. Is this what you want to do?"
                toggle={() => setConfirmDeactivateAcme(false)}
                buttons={[
                    { color: "danger", onClick: onDeactivateAcmeConfirmed, body: "Yes, deactivate" },
                    { color: "secondary", onClick: () => setConfirmDeactivateAcme(false), body: "Cancel" },
                ]}
            />

            <Dialog
                isOpen={confirmDeactivateScep}
                caption="Deactivate SCEP"
                body="You are about to deactivate SCEP protocol for the RA profile. Is this what you want to do?"
                toggle={() => setConfirmDeactivateScep(false)}
                buttons={[
                    { color: "danger", onClick: onDeactivateScepConfirmed, body: "Yes, deactivate" },
                    { color: "secondary", onClick: () => setConfirmDeactivateScep(false), body: "Cancel" },
                ]}
            />

            <Dialog
                isOpen={activateAcmeDialog}
                caption="Activate ACME protocol"
                body={ProtocolActivationDialogBody({
                    protocol: Protocol.ACME,
                    visible: activateAcmeDialog,
                    onClose: () => setActivateAcmeDialog(false),
                    raProfileUuid: raProfile?.uuid,
                    authorityInstanceUuid: raProfile?.authorityInstanceUuid,
                })}
                toggle={() => setActivateAcmeDialog(false)}
                buttons={[]}
            />

            <Dialog
                isOpen={activateScepDialog}
                caption="Activate SCEP protocol"
                body={ProtocolActivationDialogBody({
                    protocol: Protocol.SCEP,
                    visible: activateScepDialog,
                    onClose: () => setActivateScepDialog(false),
                    raProfileUuid: raProfile?.uuid,
                    authorityInstanceUuid: raProfile?.authorityInstanceUuid,
                })}
                toggle={() => setActivateScepDialog(false)}
                buttons={[]}
            />

            <Dialog
                isOpen={complianceCheck}
                caption={`Initiate Compliance Check`}
                body={"Initiate the compliance check for the certificates with RA Profile?"}
                toggle={() => setComplianceCheck(false)}
                buttons={[
                    { color: "primary", onClick: onComplianceCheck, body: "Yes" },
                    { color: "secondary", onClick: () => setComplianceCheck(false), body: "Cancel" },
                ]}
            />
        </Container>
    );
}
