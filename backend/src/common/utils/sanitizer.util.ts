/**
 * Server-side sanitization utility
 * Replaces isomorphic-dompurify to avoid ES module issues
 */

export class SanitizerUtil {
  /**
   * Sanitize HTML content on server-side
   * Simple regex-based sanitization for server environment
   */
  static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove script content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove dangerous attributes
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: protocol (except safe ones)
    sanitized = sanitized.replace(/data:(?!image\/(png|jpg|jpeg|gif|svg|webp))[^;]*/gi, '');

    // Decode HTML entities to prevent double encoding
    sanitized = sanitized
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&amp;/g, '&');

    return sanitized.trim();
  }

  /**
   * Sanitize input for SQL injection prevention
   */
  static sanitizeSql(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove common SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\b(EXEC|EXECUTE)\s*\()/gi,
      /(\b(SP_|XP_)\w+)/gi,
    ];

    let sanitized = input;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized.trim();
  }

  /**
   * Comprehensive input sanitization
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    // First sanitize HTML
    let sanitized = this.sanitizeHtml(input);

    // Then sanitize SQL
    sanitized = this.sanitizeSql(sanitized);

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Limit length to prevent DoS
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000);
    }

    return sanitized;
  }
}
