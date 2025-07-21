import * as nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PASS, SMTP_SECURE, SMTP_USER } from '../../utils/enviroments';

// Email configuration interface
interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: any[];
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private isInitialized: boolean = false;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: SMTP_HOST || 'gmail',
      secure: SMTP_SECURE === 'true' || false, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  // Initialize email service
  async initialize(): Promise<boolean> {
    try {
      // Verify connection configuration
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully!');
      this.isInitialized = true;
      return true;
    } catch (error: any) {
      console.error('❌ Email service initialization failed:', error.message);
      this.isInitialized = false;
      return false;
    }
  }

  // Check if service is ready
  isReady(): boolean {
    return this.isInitialized;
  }

  // Send HTML email
  async sendHtmlEmail(emailConfig: EmailConfig) {
    try {
      // Check if service is initialized
      if (!this.isInitialized) {
        throw new Error('Email service is not initialized. Call initialize() first.');
      }

      // Validate required parameters
      if (!emailConfig.to || !emailConfig.subject || !emailConfig.html) {
        throw new Error('Missing required parameters: to, subject, and html are required');
      }

      // Email options
      const mailOptions = {
        from: SMTP_USER,
        to: emailConfig.to,
        subject: emailConfig.subject,
        html: emailConfig.html,
        text: emailConfig.text || '',
        cc: emailConfig.cc || [],
        bcc: emailConfig.bcc || [],
        attachments: emailConfig.attachments || []
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Email sent successfully:', info.messageId);
      

    } catch (error: any) {
      console.error('❌ Error sending email:', error.message);
      
    }
  }

  // Gracefully close the transporter
  async close(): Promise<void> {
    try {
      this.transporter.close();
      console.log('📪 Email service closed successfully');
    } catch (error: any) {
      console.error('Error closing email service:', error.message);
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export the singleton instance and types
export { emailService , EmailConfig };