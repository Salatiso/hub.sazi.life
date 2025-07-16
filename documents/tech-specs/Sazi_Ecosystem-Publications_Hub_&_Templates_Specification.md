# **Sazi Ecosystem: Publications Hub & Templates Specification**

Document ID: ECO-PUBS-SPEC-V1.0  
Date: 2025-07-16  
Status: For Implementation

## **1\. Vision & Purpose**

The Publications Hub is a feature designed to empower every user of the Sazi Ecosystem to become a publisher. It removes the technical and design barriers associated with creating professional-quality articles, research papers, community bulletins, and more.

The core philosophy is to provide a set of beautiful, pre-designed, and mobile-first templates that allow users to focus solely on their content. By simply inputting their text and images into a guided editor, users can instantly generate and publish elegant, shareable, and printable documents, giving them a powerful voice to share news, insights, and stories with their community and the world.

## **2\. Key Features**

* **Template-Driven Creation:** Users will choose from a library of 5+ professional templates, each designed for a different type of publication (e.g., formal research paper, community newsletter, modern article).  
* **Simple Content Editor:** A user-friendly editor within the dashboard will guide users through adding a title, subtitle, body content, and images.  
* **Customizable Fields:** Users can add their name, company, and date to any publication. These fields can also be removed for a cleaner look.  
* **One-Click Publishing:** With a single click, a user can publish their content to a unique, shareable public URL.  
* **Print & Share Optimized:** Every template is designed to be print-friendly (A4 format) and easily shareable via a link or a downloadable QR code.  
* **Fully Translatable:** The templates will support the full range of ecosystem languages, allowing users to publish content for their specific community.

## **3\. Firestore Data Model Integration**

To support this feature, a new sub-collection will be added to the user's data model in Firestore.

**Path:** /users/{userId}/publications/{publicationId}

**Data Structure:**

{  
  "publicationId": "unique\_id\_for\_the\_article",  
  "title": "The Pothole on Main Street",  
  "subtitle": "A community update",  
  "authorName": "Salatiso Mdeni",  
  "companyName": "Sazi Community Watch",  
  "publicationDate": "timestamp",  
  "templateId": "template-modern-article",  
  "content": "\<p\>The content of the article, stored as HTML...\</p\>",  
  "isPublic": true,  
  "publicUrl": "hub.sazi.life/public/publications/unique\_hash"  
}

## **4\. Standard for All Platform-Specific Brochures**

This specification also serves as the standard for all platform-specific brochures (e.g., for SafetyHelp, Flamea). To create a compliant brochure, other platforms must:

1. **Adopt the A4/Tri-fold/Pocket-Sized Formats:** Use the provided HTML files as a base structure.  
2. **Maintain Key Features:** Ensure the brochure is printable, includes a QR code linking to the relevant platform, and has an optional "Prepared for" field.  
3. **Incorporate Ecosystem Branding:** While using their own brand colors and logos, they must include a reference to being "Part of the Sazi Ecosystem" to reinforce the unified brand identity.  
4. **Use White Backgrounds:** All printable materials must use a white background to minimize printing costs for the end-user.