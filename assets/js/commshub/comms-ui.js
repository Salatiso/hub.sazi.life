// File: /assets/js/commshub/comms-ui.js
// Manages all UI interactions and event listeners for the CommsHub.

import * as db from './comms-db.js';

let currentUserId = null;
let currentGroupId = null;
let messageListener = null;
let actionListener = null;

export function initCommsHub(userId) {
    currentUserId = userId;
    setupEventListeners();
    db.listenToUserGroups(userId, renderGroupsList);
}

function setupEventListeners() {
    // Modal handling
    document.getElementById('create-group-btn').addEventListener('click', () => showModal('create-group-modal'));
    document.getElementById('cancel-create-group').addEventListener('click', () => hideModal('create-group-modal'));
    document.getElementById('cancel-create-action').addEventListener('click', () => hideModal('create-action-modal'));

    // Form submissions
    document.getElementById('create-group-form').addEventListener('submit', handleCreateGroup);
    document.getElementById('message-form').addEventListener('submit', handleSendMessage);
    document.getElementById('create-action-form').addEventListener('submit', handleCreateAction);
    
    // Tab switching
    document.getElementById('view-chat-tab').addEventListener('click', () => switchTab('chat'));
    document.getElementById('view-actions-tab').addEventListener('click', () => switchTab('actions'));
}

function renderGroupsList(groups) {
    const listEl = document.getElementById('groups-list');
    listEl.innerHTML = '';
    if (groups.length === 0) {
        listEl.innerHTML = '<p class="text-secondary text-center p-4">No groups yet. Create one to start!</p>';
        return;
    }
    groups.forEach(group => {
        const groupEl = document.createElement('div');
        groupEl.className = 'p-3 rounded-lg cursor-pointer hover:bg-hover-bg';
        groupEl.textContent = group.groupName;
        groupEl.addEventListener('click', () => selectGroup(group));
        listEl.appendChild(groupEl);
    });
}

function selectGroup(group) {
    currentGroupId = group.id;
    document.getElementById('chat-welcome-screen').classList.add('hidden');
    document.getElementById('active-chat-view').classList.remove('hidden');
    document.getElementById('active-group-name').textContent = group.groupName;

    // Unsubscribe from previous listeners if they exist
    if (messageListener) messageListener();
    if (actionListener) actionListener();

    // Listen to new messages and actions
    messageListener = db.listenToMessages(group.id, renderMessages);
    actionListener = db.listenToGroupActions(group.id, renderActions);
    
    switchTab('chat'); // Default to chat view
}

function renderMessages(messages) {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    messages.forEach(msg => {
        const msgEl = document.createElement('div');
        const isSender = msg.senderId === currentUserId;
        msgEl.className = `p-3 rounded-lg max-w-xs ${isSender ? 'bg-accent-color text-accent-text self-end' : 'bg-card-bg'}`;
        msgEl.innerHTML = `
            <p class="text-sm">${msg.content}</p>
            <button class="make-action-btn text-xs opacity-50 hover:opacity-100 float-right ml-2"><i class="fas fa-flag"></i></button>
        `;
        msgEl.querySelector('.make-action-btn').addEventListener('click', () => openCreateActionModal(msg.content));
        container.appendChild(msgEl);
    });
    container.scrollTop = container.scrollHeight; // Scroll to bottom
}

function renderActions(actions) {
    const container = document.getElementById('actions-container');
    container.innerHTML = '';
     if (actions.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center p-4">No actions created for this group yet.</p>';
        return;
    }
    actions.forEach(action => {
        const actionEl = document.createElement('div');
        actionEl.className = 'p-3 bg-main rounded-lg';
        actionEl.innerHTML = `
            <p class="font-bold">${action.title}</p>
            <p class="text-xs text-secondary">Assigned to: ${action.assigneeIds.join(', ')} | Due: ${action.dueDate || 'N/A'}</p>
            <div class="text-right text-xs font-bold ${action.status === 'Done' ? 'text-green-400' : 'text-yellow-400'}">${action.status}</div>
        `;
        container.appendChild(actionEl);
    });
}

function openCreateActionModal(messageContent) {
    document.getElementById('action-title').value = messageContent;
    // In a real app, you'd populate the assignee dropdown here
    showModal('create-action-modal');
}

async function handleCreateGroup(e) {
    e.preventDefault();
    const groupName = document.getElementById('new-group-name').value;
    if (groupName && currentUserId) {
        await db.createGroup(groupName, currentUserId, []);
        hideModal('create-group-modal');
        e.target.reset();
    }
}

async function handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('message-input');
    if (input.value && currentGroupId && currentUserId) {
        await db.sendMessage(currentGroupId, currentUserId, input.value);
        input.value = '';
    }
}

async function handleCreateAction(e) {
    e.preventDefault();
    const actionData = {
        title: document.getElementById('action-title').value,
        assigneeIds: [document.getElementById('action-assignee').value || currentUserId], // Simplified
        dueDate: document.getElementById('action-due-date').value,
        groupId: currentGroupId,
        creatorId: currentUserId
    };
    await db.createAction(actionData);
    hideModal('create-action-modal');
    e.target.reset();
}

function switchTab(tabName) {
    const chatTab = document.getElementById('view-chat-tab');
    const actionsTab = document.getElementById('view-actions-tab');
    const messagesContainer = document.getElementById('messages-container');
    const actionsContainer = document.getElementById('actions-container');

    if (tabName === 'chat') {
        chatTab.classList.add('font-bold', 'text-primary');
        actionsTab.classList.remove('font-bold', 'text-primary');
        messagesContainer.classList.remove('hidden');
        actionsContainer.classList.add('hidden');
    } else {
        actionsTab.classList.add('font-bold', 'text-primary');
        chatTab.classList.remove('font-bold', 'text-primary');
        actionsContainer.classList.remove('hidden');
        messagesContainer.classList.add('hidden');
    }
}

function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
function hideModal(id) { document.getElementById(id).classList.add('hidden'); }
