
import { sql } from "@/lib/db"; // Assuming your db connection is here

// Define the shape of the data needed to create a notification
interface NotificationData {
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  relatedId?: number;
  relatedType?: 'course' | 'module' | 'message'; 
  link?: string;
}

/**
 * Creates a new notification for a user in the database.
 * @param data - The data for the notification.
 */
export async function createNotification(data: NotificationData): Promise<void> {
  try {
    await sql`
      INSERT INTO notifications (
        user_id, 
        title, 
        message, 
        type, 
        read, 
        related_id, 
        related_type,
        link,
        created_at,
        updated_at
      ) VALUES (
        ${data.userId},
        ${data.title},
        ${data.message},
        ${data.type},
        FALSE,
        ${data.relatedId || null},
        ${data.relatedType || null},
        ${data.link || null}, 
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `;
    console.log(`Notification created for user ${data.userId}: "${data.title}"`);
  } catch (error) {
    console.error("Failed to create notification:", error);
    // In a real-world app, you might add more robust error handling or logging here.
        throw error; 
  }
}

// --- Example Specific Notification Functions ---

/**
 * Creates a notification for a successful course enrollment.
 * @param userId - The ID of the user who enrolled.
 * @param courseId - The ID of the course.
 * @param courseTitle - The title of the course.
 */
export async function createEnrollmentNotification(userId: number, courseId: number, courseTitle: string) {
  await createNotification({
    userId,
    title: "Enrollment Successful!",
    message: `You have successfully enrolled in the "${courseTitle}" course. Happy learning!`,
    type: 'success',
    relatedId: courseId,
    relatedType: 'course',
    link: `/courses/${courseId}/lessons`,

  });
}

/**
 * Creates a notification for module completion.
 * @param userId - The ID of the user.
 * @param moduleId - The ID of the completed module.
 * @param moduleTitle - The title of the module.
 * @param courseTitle - The title of the course the module belongs to.
 */
export async function createModuleCompletionNotification(userId: number, moduleId: number, moduleTitle: string, courseId: number ,courseTitle: string) {
  await createNotification({
    userId,
    title: "Module Completed!",
    message: `Great job! You've completed the "${moduleTitle}" module in the "${courseTitle}" course.`,
    type: 'info',
    relatedId: moduleId,
    relatedType: 'module',
    link: `/courses/${courseId}/lessons`,

  });
}

/**
 * Creates a notification for a new message.
 * @param userId - The ID of the user receiving the message.
 * @param senderName - The name of the person who sent the message.
 * @param messageId - The ID of the new message.
 */
export async function createNewMessageNotification(userId: number, senderName: string, messageId: number) {
  await createNotification({
    userId,
    title: "New Message Received",
    message: `You have a new message from ${senderName}.`,
    type: 'info',
    relatedId: messageId,
    relatedType: 'message',
    link: `/dashboard/messages`,

  });
}
