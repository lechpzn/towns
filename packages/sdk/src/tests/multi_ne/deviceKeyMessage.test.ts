/**
 * @group main
 */

import debug from 'debug'
import { Client } from '../../client'
import { makeDonePromise, makeTestClient } from '../testUtils'
import { UserDevice } from '@towns-protocol/encryption'

const log = debug('test:deviceKeyMessageTest')

describe('deviceKeyMessageTest', () => {
    let bobsClient: Client
    let alicesClient: Client

    beforeEach(async () => {
        log('beforeEach')
        bobsClient = await makeTestClient()
        alicesClient = await makeTestClient()
        log('after beforeEach')
    })

    afterEach(async () => {
        await bobsClient.stop()
        await alicesClient.stop()
    })

    test('bobUploadsDeviceKeys', async () => {
        log('bobUploadsDeviceKeys')
        await bobsClient.initializeUser()
        // Bob gets created, starts syncing, and uploads his device keys.
        const bobsUserId = bobsClient.userId
        const bobUserMetadataStreamId = bobsClient.userMetadataStreamId
        const bobSelfDeviceKeyDone = makeDonePromise()
        log('listening for userDeviceKeyMessage')
        bobsClient.once(
            'userDeviceKeyMessage',
            (streamId: string, userId: string, userDevice: UserDevice): void => {
                log('userDeviceKeyMessage for Bob', streamId, userId, userDevice)
                bobSelfDeviceKeyDone.runAndDone(() => {
                    expect(streamId).toBe(bobUserMetadataStreamId)
                    expect(userId).toBe(bobsUserId)
                    expect(userDevice.deviceKey).toBeDefined()
                })
            },
        )
        bobsClient.startSync()
        log('started sync')
        await bobSelfDeviceKeyDone.expectToSucceed()
    })

    test('bobDownloadsOwnDeviceKeys', async () => {
        log('bobDownloadsOwnDeviceKeys')
        // Bob gets created, starts syncing, and uploads his device keys.
        await expect(bobsClient.initializeUser()).resolves.not.toThrow()
        bobsClient.startSync()
        const bobsUserId = bobsClient.userId
        const bobSelfDeviceKeyDone = makeDonePromise()
        bobsClient.once(
            'userDeviceKeyMessage',
            (streamId: string, userId: string, userDevice: UserDevice): void => {
                log('userDeviceKeyMessage for Bob', streamId, userId, userDevice)
                bobSelfDeviceKeyDone.runAndDone(() => {
                    expect(streamId).toBe(bobUserMetadataStreamId)
                    expect(userId).toBe(bobsUserId)
                    expect(userDevice.deviceKey).toBeDefined()
                })
            },
        )
        const bobUserMetadataStreamId = bobsClient.userMetadataStreamId
        await bobSelfDeviceKeyDone.expectToSucceed()
        const deviceKeys = await bobsClient.downloadUserDeviceInfo([bobsUserId])
        expect(deviceKeys[bobsUserId]).toBeDefined()
    })

    test('bobDownloadsAlicesDeviceKeys', async () => {
        log('bobDownloadsAlicesDeviceKeys')
        // Bob gets created, starts syncing, and uploads his device keys.
        await expect(bobsClient.initializeUser()).resolves.not.toThrow()
        await expect(alicesClient.initializeUser()).resolves.not.toThrow()
        bobsClient.startSync()
        alicesClient.startSync()
        const alicesUserId = alicesClient.userId
        const alicesSelfDeviceKeyDone = makeDonePromise()
        alicesClient.once(
            'userDeviceKeyMessage',
            (streamId: string, userId: string, userDevice: UserDevice): void => {
                log('userDeviceKeyMessage for Alice', streamId, userId, userDevice)
                alicesSelfDeviceKeyDone.runAndDone(() => {
                    expect(streamId).toBe(aliceUserMetadataStreamId)
                    expect(userId).toBe(alicesUserId)
                    expect(userDevice.deviceKey).toBeDefined()
                })
            },
        )
        const aliceUserMetadataStreamId = alicesClient.userMetadataStreamId
        const deviceKeys = await bobsClient.downloadUserDeviceInfo([alicesUserId])
        expect(deviceKeys[alicesUserId]).toBeDefined()
    })

    test('bobDownloadsAlicesAndOwnDeviceKeys', async () => {
        log('bobDownloadsAlicesAndOwnDeviceKeys')
        // Bob, Alice get created, starts syncing, and uploads respective device keys.
        await expect(bobsClient.initializeUser()).resolves.not.toThrow()
        await expect(alicesClient.initializeUser()).resolves.not.toThrow()
        bobsClient.startSync()
        alicesClient.startSync()
        const bobsUserId = bobsClient.userId
        const alicesUserId = alicesClient.userId
        const bobSelfDeviceKeyDone = makeDonePromise()
        // bobs client should sync userDeviceKeyMessage twice (once for alice, once for bob)
        bobsClient.on(
            'userDeviceKeyMessage',
            (streamId: string, userId: string, userDevice: UserDevice): void => {
                log('userDeviceKeyMessage', streamId, userId, userDevice)
                bobSelfDeviceKeyDone.runAndDone(() => {
                    expect([bobUserMetadataStreamId, aliceUserMetadataStreamId]).toContain(streamId)
                    expect([bobsUserId, alicesUserId]).toContain(userId)
                    expect(userDevice.deviceKey).toBeDefined()
                })
            },
        )
        const aliceUserMetadataStreamId = alicesClient.userMetadataStreamId
        const bobUserMetadataStreamId = bobsClient.userMetadataStreamId
        // give the state sync a chance to run for both deviceKeys
        const deviceKeys = await bobsClient.downloadUserDeviceInfo([alicesUserId, bobsUserId])
        expect(Object.keys(deviceKeys).length).toEqual(2)
        expect(deviceKeys[alicesUserId]).toBeDefined()
        expect(deviceKeys[bobsUserId]).toBeDefined()
    })

    test('bobDownloadsAlicesMultipleAndOwnDeviceKeys', async () => {
        log('bobDownloadsAlicesAndOwnDeviceKeys')
        // Bob, Alice get created, starts syncing, and uploads respective device keys.
        await expect(bobsClient.initializeUser()).resolves.not.toThrow()
        await expect(alicesClient.initializeUser()).resolves.not.toThrow()
        bobsClient.startSync()
        alicesClient.startSync()
        const bobsUserId = bobsClient.userId
        const alicesUserId = alicesClient.userId
        const bobSelfDeviceKeyDone = makeDonePromise()

        // Alice should restart her cryptoBackend multiple times, each time uploading new device keys.
        let tenthDeviceKey = ''
        let eleventhDeviceKey = ''
        for (let i = 0; i < 20; i++) {
            await alicesClient.resetCrypto()
            if (i === 9) {
                tenthDeviceKey = alicesClient.userDeviceKey().deviceKey
            } else if (i === 10) {
                eleventhDeviceKey = alicesClient.userDeviceKey().deviceKey
            }
        }
        // bobs client should sync userDeviceKeyMessages
        bobsClient.on(
            'userDeviceKeyMessage',
            (streamId: string, userId: string, userDevice: UserDevice): void => {
                log('userDeviceKeyMessage', streamId, userId, userDevice)
                bobSelfDeviceKeyDone.runAndDone(() => {
                    expect([bobUserMetadataStreamId, aliceUserMetadataStreamId]).toContain(streamId)
                    expect([bobsUserId, alicesUserId]).toContain(userId)
                    expect(userDevice.deviceKey).toBeDefined()
                })
            },
        )
        const aliceUserMetadataStreamId = alicesClient.userMetadataStreamId
        const bobUserMetadataStreamId = bobsClient.userMetadataStreamId
        // give the state sync a chance to run for both deviceKeys
        const deviceKeys = await bobsClient.downloadUserDeviceInfo([alicesUserId, bobsUserId])
        const aliceDevices = deviceKeys[alicesUserId]
        const aliceDeviceKeys = aliceDevices.map((device) => device.deviceKey)

        expect(aliceDevices).toBeDefined()
        expect(aliceDevices.length).toEqual(10)
        // eleventhDeviceKey out of 20 should be downloaded as part of downloadKeysForUsers
        expect(aliceDeviceKeys).toContain(eleventhDeviceKey)
        // latest key should be downloaded
        expect(aliceDeviceKeys).toContain(alicesClient.userDeviceKey().deviceKey)
        // any key uploaded earlier than the lookback window (i.e. 10) should not be downloaded
        expect(aliceDeviceKeys).not.toContain(tenthDeviceKey)
        expect(deviceKeys[bobsUserId]).toBeDefined()
    })
})
