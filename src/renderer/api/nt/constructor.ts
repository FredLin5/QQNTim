import { downloadMedia } from "./media";
import { QQNTim } from "@flysoftbeta/qqntim-typings";

export function constructTextElement(ele: any): QQNTim.API.Renderer.NT.MessageElementText {
    return {
        type: "text",
        content: ele.textElement.content,
        raw: ele,
    };
}

export function constructImageElement(ele: any, msg: any): QQNTim.API.Renderer.NT.MessageElementImage {
    return {
        type: "image",
        file: ele.picElement.sourcePath,
        downloadedPromise: downloadMedia(msg.msgId, ele.elementId, msg.peerUid, msg.chatType, ele.picElement.thumbPath.get(0), ele.picElement.sourcePath),
        raw: ele,
    };
}
export function constructFaceElement(ele: any): QQNTim.API.Renderer.NT.MessageElementFace {
    return {
        type: "face",
        faceIndex: ele.faceElement.faceIndex,
        faceType: ele.faceElement.faceType == 1 ? "normal" : ele.faceElement.faceType == 2 ? "normal-extended" : ele.faceElement.faceType == 3 ? "super" : ele.faceElement.faceType,
        faceSuperIndex: ele.faceElement.stickerId && parseInt(ele.faceElement.stickerId),
        raw: ele,
    };
}
export function constructRawElement(ele: any): QQNTim.API.Renderer.NT.MessageElementRaw {
    return {
        type: "raw",
        raw: ele,
    };
}
export function constructMessage(msg: any): QQNTim.API.Renderer.NT.Message {
    const downloadedPromises: Promise<void>[] = [];
    const elements = (msg.elements as any[]).map((ele): QQNTim.API.Renderer.NT.MessageElement => {
        if (ele.elementType == 1) return constructTextElement(ele);
        else if (ele.elementType == 2) {
            const element = constructImageElement(ele, msg);
            downloadedPromises.push(element.downloadedPromise);
            return element;
        } else if (ele.elementType == 6) return constructFaceElement(ele);
        else return constructRawElement(ele);
    });
    return {
        allDownloadedPromise: Promise.all(downloadedPromises),
        peer: {
            uid: msg.peerUid,
            name: msg.peerName,
            chatType: msg.chatType == 1 ? "friend" : msg.chatType == 2 ? "group" : "others",
        },
        sender: {
            uid: msg.senderUid,
            memberName: msg.sendMemberName || msg.sendNickName,
            nickName: msg.sendNickName,
        },
        elements: elements,
        raw: msg,
    };
}
