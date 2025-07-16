// File: /assets/js/commshub/comms-db.js
// Handles all Firestore database interactions for the CommsHub.

import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

// --- Group Functions ---
export function createGroup(groupName, adminId, memberIds) {
    return addDoc(collection(db, 'groups'), {
        groupName,
        adminId,
        memberIds: [...memberIds, adminId], // Admin is always a member
        createdAt: serverTimestamp()
    });
}

export function listenToUserGroups(userId, callback) {
    const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', userId));
    return onSnapshot(q, (querySnapshot) => {
        const groups = [];
        querySnapshot.forEach((doc) => {
            groups.push({ id: doc.id, ...doc.data() });
        });
        callback(groups);
    });
}

// --- Message Functions ---
export function sendMessage(groupId, senderId, content) {
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    return addDoc(messagesRef, {
        senderId,
        content,
        timestamp: serverTimestamp()
    });
}

export function listenToMessages(groupId, callback) {
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    return onSnapshot(q, (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
    });
}

// --- Action Functions ---
export function createAction(actionData) {
    return addDoc(collection(db, 'actions'), {
        ...actionData,
        status: 'To Do',
        createdAt: serverTimestamp()
    });
}

export function listenToGroupActions(groupId, callback) {
    const q = query(collection(db, 'actions'), where('groupId', '==', groupId));
    return onSnapshot(q, (querySnapshot) => {
        const actions = [];
        querySnapshot.forEach((doc) => {
            actions.push({ id: doc.id, ...doc.data() });
        });
        callback(actions);
    });
}
