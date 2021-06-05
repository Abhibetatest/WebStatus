import React, {FunctionComponent, useEffect, useState} from 'react';
import {Card, CardBody, CardHeader, Table} from "reactstrap";

import styles from './WebsiteDetail.module.scss';
import {LocalNotifications, PermissionStatus} from "@capacitor/local-notifications";

type WebsiteDetailProps = {
    websiteName: string;
    websiteUrl: string;
}

enum networkStatus {
    NetworkFail = 'Internet connection error',
    Active = 'Active',
    Inactive = 'Inactive'
}

const WebsiteDetail: FunctionComponent<WebsiteDetailProps> = ({websiteName, websiteUrl}: WebsiteDetailProps) => {

    const [status, setStatus] = useState('Fetching...');

    useEffect(() => {
        LocalNotifications.requestPermissions()
            .then((permissionStatus: PermissionStatus) => {
                console.log(permissionStatus.display);
            })
    }, [])

    const checkWebsiteStatus = async () => {
        if (!navigator.onLine) {
            setStatus(networkStatus.NetworkFail);
            return;
        }
        await fetch(websiteUrl, {mode: 'no-cors'})
            .then((res) => {
                setStatus(networkStatus.Active);
                scheduleNotification(websiteName, 'Website is up and running');
            }).catch((err) => {
                setStatus(networkStatus.Inactive);
                scheduleNotification(websiteName, 'Aww!! Website has stopped running');
            })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            checkWebsiteStatus();
        }, 1000 * 60 * 30);

        return () => clearInterval(interval);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const scheduleNotification = async (title: string, body: string) => {
        await LocalNotifications.schedule({
            notifications: [{
                title: title,
                body: body,
                id: 1,
            }]
        })
    }

    return (
        <div className={`container d-flex align-items-center justify-content-center ${styles.WebsiteDetails}`}>
            <Card className="w-100">
                <CardHeader className="d-flex">Website Status</CardHeader>
                <CardBody className={styles.CardBody}>
                    <Table bordered>
                        <tbody>
                        <tr>
                            <td>Name</td>
                            <td>{websiteName}</td>
                        </tr>
                        <tr>
                            <td>Url</td>
                            <td><a href={websiteUrl} target='_blank' rel='noreferrer'>{websiteUrl}</a></td>
                        </tr>
                        <tr>
                            <td>Status</td>
                            <td className={`${status === networkStatus.Active? styles.green: styles.red} ${styles.bold}`}>{status}</td>
                        </tr>
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    )
}

export default WebsiteDetail;
