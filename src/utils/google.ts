import { GoogleSignin } from '@react-native-community/google-signin';
import GDrive from "react-native-google-drive-api-wrapper";
import { Type, DiskItem } from 'models/google'
import { FileBackup } from 'models/backup';

const folderType = "application/vnd.google-apps.folder"
const jsonType = "application/json"

GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/drive'],
    offlineAccess: false,
    forceCodeForRefreshToken: true,
})

export async function signOut() {
    const isSigned = await GoogleSignin.isSignedIn()
    if (!isSigned)
        return

    const tokens = await GoogleSignin.getTokens()
    await GoogleSignin.clearCachedAccessToken(tokens.accessToken)
    await GoogleSignin.signOut()
}

export async function signIn() {
    const user = await GoogleSignin.getCurrentUser()
    const isSigned = await GoogleSignin.isSignedIn()
    if (user == null || !isSigned)
        await GoogleSignin.signIn()

    const tokens = await GoogleSignin.getTokens()
    await GDrive.setAccessToken(tokens.accessToken);
    await GDrive.init()
}

export async function safeSave(dir: string, fileName: string, file: string): Promise<boolean> {
    await GDrive.files.safeCreateFolder({
        name: dir,
        parents: ["root"]
    });

    const fieldIdDir = await GDrive.files.getId(dir, ["root"])
    const fieldId = await GDrive.files.getId(fileName, ["root", fieldIdDir])
    if (fieldId == undefined) {
        const result = await GDrive.files.createFileMultipart(
            file,
            "application/json",
            {
                parents: [fieldIdDir],
                name: fileName
            }, false);
        if (result.status != 200)
            return false
    }

    return true
}

export async function getItems(path: string): Promise<Array<DiskItem>> {
    const rs = await GDrive.files.list({ q: `"${path}" in parents and (mimeType = "${folderType}" or mimeType = "${jsonType}")` })
    const rsBody = await rs.json()
    const result = new Array<DiskItem>()
    for (let index in rsBody.files) {
        const file = rsBody.files[index]

        let itemType: Type
        switch (file.mimeType) {
            case folderType:
                itemType = Type.Dir
                break
            case jsonType:
                itemType = Type.Json
                break
            default:
                continue
        }

        result.push(new DiskItem(file.id, file.name, itemType))
    }
    return result
}

export async function getFileBackup(id: string): Promise<FileBackup> {
    const rs = await GDrive.files.get(id, { alt: "media" })
    const rsBody = await rs.json()
    if (rsBody.algorithm == undefined || rsBody.seed == undefined) {
        throw ("Invalid file")
    }
    return rsBody
}