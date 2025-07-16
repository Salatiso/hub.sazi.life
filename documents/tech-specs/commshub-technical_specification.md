# CommsHub: Technical & Functional Specification

**Document ID:** COMMS-TECH-SPEC-V1.0  
**Date:** 2025-07-16  
**Status:** For Implementation

---

## 1. Module Vision & Philosophy

The **CommsHub** is the communication and action-management backbone of the **Sazi Ecosystem**. Its core purpose is to bridge the critical gap between conversation and execution. It provides a structured environment where discussions in families, communities, and small businesses are seamlessly transformed into accountable, trackable tasks, ensuring that dialogue leads to tangible outcomes.

---

## 2. Core Features

- **Group-Based Communication**:  
  Users can create private, topic-specific groups for different contexts (e.g., Family Council, Tenants, Stokvel).

- **Real-Time Chat**:  
  A familiar, real-time messaging interface for fluid conversation.

- **"Message-to-Action" Conversion**:  
  The core innovation. A single click on any message allows it to be converted into a structured action item.

- **Action Dashboards**:  
  - *My Actions*: Personal dashboard for individual accountability.  
  - *Group Dashboard*: Administrative view of all group actions.

- **WhatsApp Chat Importer**:  
  A utility to upload and parse exported WhatsApp chats, allowing users to create actions from past conversations.

- **Ecosystem Integration**:  
  Actions and outcomes within the CommsHub will create verifiable entries on a user's LifeCV (e.g., "Managed a community project").

---

## 3. Firestore Data Model

This schema is designed for **real-time performance and scalability**, separating communication from tasks.

| **Collection Path**                | **Document ID** | **Key Fields & Description** |
|-----------------------------------|------------------|-------------------------------|
| `/groups`                         | `{groupId}`      | The main document for a chat group.<br>**Fields**: `groupName` (String), `adminId` (String), `memberIds` (Array of user IDs), `createdAt` (Timestamp). |
| `/groups/{groupId}/messages`      | `{messageId}`    | A single message within a group.<br>**Fields**: `senderId` (String), `content` (String), `timestamp` (Timestamp), `hasAction` (Boolean). |
| `/actions`                        | `{actionId}`     | A standalone document for a task.<br>**Fields**: `sourceMessageId` (String, optional), `groupId` (String), `title` (String), `assigneeIds` (Array), `dueDate` (Timestamp), `priority` (String), `status` (String: "To Do", "In Progress", "Done"), `creatorId` (String). |
| `/actions/{actionId}/comments`    | `{commentId}`    | A sub-collection for discussion on a specific action.<br>**Fields**: `senderId` (String), `comment` (String), `timestamp` (Timestamp). |

---

## 4. Key API & Logic Flows

- **Real-Time Chat**:  
  Implemented using Firestore’s `onSnapshot` listener. The client listens for changes to the `/groups/{groupId}/messages` collection and updates the UI in real-time.

- **Action Creation**:  
  When a user clicks **"Make it an Action"**, the client writes a new document to the top-level `/actions` collection.

- **WhatsApp Parser (`comms-logic.js`)**:  
  The `parseWhatsApp` function will use a robust regular expression to process uploaded `.txt` files. The regex will capture date, time, sender, and message content, including multi-line messages.  
  **Regex Pattern**:  
  ```js
  (\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}) - ([^:]+): ([\s\S]+?)(?=\n\d{1,2}\/\d{1,2}\/\d{2,4},|$)
  ```

- **Notifications (Cloud Function)**:  
  A Firebase Cloud Function (`onActionCreate`) will be triggered when a new document is written to `/actions`. It will read the `assigneeIds` and send **email notifications** to the assigned users.

---
