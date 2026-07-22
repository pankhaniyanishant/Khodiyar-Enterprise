import prisma from '../db/prisma.js';
import emailService from './email.service.js';
import hashService from './hash.service.js';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

class VerificationService {
  /**
   * Generate 6 digit OTP
   * @returns {string} The generated OTP
   * @private
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create verification session for user
   * @param {Object} user - User object {id, email, name}
   */
  async createVerification(user) {
    try {
      const otp = this.generateOTP();
      const hashedOtp = hashService.hashOTP(otp);
      const token = crypto.randomUUID();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.verification.upsert({
        where: { user_id: user.id },
        create: {
          user_id: user.id,
          otp: hashedOtp,
          token,
          otp_expires_at: otpExpiresAt,
          token_expires_at: tokenExpiresAt,
        },
        update: {
          otp: hashedOtp,
          token,
          otp_expires_at: otpExpiresAt,
          token_expires_at: tokenExpiresAt,
          last_resent_at: new Date(),
        },
      });

      /*await emailService.sendVerificationEmail(
        user.email,
        user.name,
        token,
        otp
      );*/
      // Return token for frontend to use in verification flow
      return { token };
    } catch (error) {
      logger.error('Failed to create verification', {
        error: error.message,
        userId: user.id,
        service: 'verification.service',
      });
      throw error instanceof ApiError
        ? error
        : new ApiError(500, 'Failed to setup verification');
    }
  }

  /**
   * Verify email OTP
   * @param {string} token - Verification token
   * @param {string} otp - OTP to verify
   */
  async verifyEmailOTP(token, otp) {
    try {
      const verification = await prisma.verification.findFirst({
        where: { token },
      });

      if (!verification) {
        throw new ApiError(404, 'Invalid or expired verification link');
      }

      if (new Date() > new Date(verification.token_expires_at)) {
        await prisma.verification.delete({
          where: { user_id: verification.user_id },
        });
        throw new ApiError(
          400,
          'Verification link has expired. Please register again.'
        );
      }

      const isOtpValid = hashService.compareOTP(otp, verification.otp);
      if (!isOtpValid) {
        throw new ApiError(400, 'Invalid OTP');
      }

      if (new Date() > new Date(verification.otp_expires_at)) {
        throw new ApiError(400, 'OTP has expired. Please resend a new OTP.');
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: verification.user_id },
          data: { status: 'active' },
        }),
        prisma.verification.delete({
          where: { user_id: verification.user_id },
        }),
      ]);

      return { message: 'Email verified successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to verify email OTP', {
        error: error.message,
        service: 'verification.service',
      });
      throw new ApiError(500, 'Verification failed');
    }
  }

  /**
   * Get verification status for a user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} Status object {exists, isExpired, expiresAt}
   */
  async getVerificationStatus(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, status: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.status === 'active') {
        throw new ApiError(400, 'User email is already verified');
      }

      const verification = await prisma.verification.findUnique({
        where: { user_id: user.id },
      });

      if (!verification) {
        return {
          exists: false,
          isExpired: null,
          expiresAt: null,
        };
      }

      const isExpired = new Date() > new Date(verification.token_expires_at);

      return {
        exists: true,
        isExpired,
        expiresAt: verification.token_expires_at,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to get verification status', {
        error: error.message,
        email,
        service: 'verification.service',
      });
      throw new ApiError(500, 'Failed to retrieve verification status');
    }
  }

  /**
   * Resend verification OTP
   * @param {string} token - Verification token
   */
  async resendVerificationOTP(token) {
    try {
      const verification = await prisma.verification.findFirst({
        where: { token },
        include: { user: { select: { name: true, email: true } } },
      });

      if (!verification) {
        throw new ApiError(404, 'Verification session not found');
      }

      // Rate limit check
      const lastResent = new Date(verification.last_resent_at).getTime();
      const diff = (new Date().getTime() - lastResent) / 1000;
      if (diff < 60) {
        throw new ApiError(429, `Please wait ${Math.ceil(60 - diff)} seconds`);
      }

      const newOtp = this.generateOTP();
      const hashedOtp = hashService.hashOTP(newOtp);

      await prisma.verification.update({
        where: { user_id: verification.user_id },
        data: {
          otp: hashedOtp,
          otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
          last_resent_at: new Date(),
        },
      });

     /* await emailService.sendVerificationEmail(
        verification.user.email,
        verification.user.name,
        token,
        newOtp
      );*/

      return { message: 'OTP resent successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to resend verification OTP', {
        error: error.message,
        service: 'verification.service',
      });
      throw new ApiError(500, 'Resend failed');
    }
  }
}

export default new VerificationService();
