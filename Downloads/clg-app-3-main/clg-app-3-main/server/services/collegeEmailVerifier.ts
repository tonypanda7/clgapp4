// College Email Verification Service
// Validates and verifies university email addresses

interface CollegeInfo {
  name: string;
  domain: string;
  country: string;
  type: 'university' | 'college' | 'institute';
  verified: boolean;
}

// Known university domains database
const VERIFIED_COLLEGE_DOMAINS: Record<string, CollegeInfo> = {
  // Indian Universities
  'snuchennai.edu.in': {
    name: 'Shiv Nadar University Chennai',
    domain: 'snuchennai.edu.in',
    country: 'India',
    type: 'university',
    verified: true
  },
  'vit.ac.in': {
    name: 'Vellore Institute of Technology',
    domain: 'vit.ac.in',
    country: 'India',
    type: 'institute',
    verified: true
  },
  'iitm.ac.in': {
    name: 'Indian Institute of Technology Madras',
    domain: 'iitm.ac.in',
    country: 'India',
    type: 'institute',
    verified: true
  },
  'anna.ac.in': {
    name: 'Anna University',
    domain: 'anna.ac.in',
    country: 'India',
    type: 'university',
    verified: true
  },
  'srmist.edu.in': {
    name: 'SRM Institute of Science and Technology',
    domain: 'srmist.edu.in',
    country: 'India',
    type: 'institute',
    verified: true
  },
  
  // US Universities
  'harvard.edu': {
    name: 'Harvard University',
    domain: 'harvard.edu',
    country: 'USA',
    type: 'university',
    verified: true
  },
  'mit.edu': {
    name: 'Massachusetts Institute of Technology',
    domain: 'mit.edu',
    country: 'USA',
    type: 'institute',
    verified: true
  },
  'stanford.edu': {
    name: 'Stanford University',
    domain: 'stanford.edu',
    country: 'USA',
    type: 'university',
    verified: true
  },
  'student.harvard.edu': {
    name: 'Harvard University (Student)',
    domain: 'student.harvard.edu',
    country: 'USA',
    type: 'university',
    verified: true
  },
  'student.mit.edu': {
    name: 'MIT (Student)',
    domain: 'student.mit.edu',
    country: 'USA',
    type: 'institute',
    verified: true
  }
};

interface EmailVerificationResult {
  isValid: boolean;
  isCollegeEmail: boolean;
  collegeInfo?: CollegeInfo;
  domain: string;
  suggestions?: string[];
  error?: string;
}

class CollegeEmailVerifier {
  
  /**
   * Verify if an email is from a legitimate college/university
   */
  async verifyCollegeEmail(email: string): Promise<EmailVerificationResult> {
    try {
      // Basic email format validation
      if (!this.isValidEmailFormat(email)) {
        return {
          isValid: false,
          isCollegeEmail: false,
          domain: '',
          error: 'Invalid email format'
        };
      }

      const domain = this.extractDomain(email);
      
      // Check against known university domains
      const collegeInfo = VERIFIED_COLLEGE_DOMAINS[domain];
      
      if (collegeInfo) {
        return {
          isValid: true,
          isCollegeEmail: true,
          collegeInfo,
          domain,
        };
      }

      // Check for common university patterns
      const universityPatterns = [
        /\.edu$/,           // US universities
        /\.edu\.in$/,       // Indian universities
        /\.ac\.in$/,        // Indian academic institutions
        /\.edu\.au$/,       // Australian universities
        /\.ac\.uk$/,        // UK academic institutions
        /\.edu\.sg$/,       // Singapore universities
        /\.edu\.my$/,       // Malaysian universities
      ];

      const isLikelyUniversity = universityPatterns.some(pattern => pattern.test(domain));
      
      if (isLikelyUniversity) {
        return {
          isValid: true,
          isCollegeEmail: true,
          domain,
          collegeInfo: {
            name: this.formatCollegeName(domain),
            domain,
            country: this.guessCountryFromDomain(domain),
            type: 'university',
            verified: false // Not in our verified list
          }
        };
      }

      // Check for common typos and suggest corrections
      const suggestions = this.getSuggestions(domain);

      return {
        isValid: true,
        isCollegeEmail: false,
        domain,
        suggestions,
        error: 'Email domain does not appear to be from a university or college'
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return {
        isValid: false,
        isCollegeEmail: false,
        domain: '',
        error: 'Email verification failed'
      };
    }
  }

  /**
   * Generate verification token for email confirmation
   */
  generateVerificationToken(): string {
    return Math.random().toString(36).substr(2, 32) + Date.now().toString(36);
  }

  /**
   * Validate basic email format
   */
  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Extract domain from email
   */
  private extractDomain(email: string): string {
    return email.split('@')[1]?.toLowerCase() || '';
  }

  /**
   * Format college name from domain
   */
  private formatCollegeName(domain: string): string {
    // Remove common suffixes and format
    const cleanDomain = domain
      .replace(/\.(edu|ac)\.(in|uk|au|sg|my)$/, '')
      .replace(/\.edu$/, '')
      .replace(/\./g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return cleanDomain + ' University';
  }

  /**
   * Guess country from domain
   */
  private guessCountryFromDomain(domain: string): string {
    if (domain.endsWith('.edu.in') || domain.endsWith('.ac.in')) return 'India';
    if (domain.endsWith('.edu')) return 'USA';
    if (domain.endsWith('.ac.uk')) return 'UK';
    if (domain.endsWith('.edu.au')) return 'Australia';
    if (domain.endsWith('.edu.sg')) return 'Singapore';
    if (domain.endsWith('.edu.my')) return 'Malaysia';
    return 'Unknown';
  }

  /**
   * Get suggestions for common typos
   */
  private getSuggestions(domain: string): string[] {
    const suggestions: string[] = [];
    
    // Common typos for popular domains
    const commonCorrections: Record<string, string> = {
      'gmail.com': 'Did you mean to use your university email instead?',
      'yahoo.com': 'Did you mean to use your university email instead?',
      'hotmail.com': 'Did you mean to use your university email instead?',
      'outlook.com': 'Did you mean to use your university email instead?',
    };

    if (commonCorrections[domain]) {
      suggestions.push(commonCorrections[domain]);
    }

    // Suggest adding .edu if domain looks like a university
    if (!domain.includes('.edu') && !domain.includes('.ac')) {
      suggestions.push(`Did you mean ${domain.split('.')[0]}.edu?`);
    }

    return suggestions;
  }

  /**
   * Check if email domain is in our verified list
   */
  isVerifiedCollegeDomain(domain: string): boolean {
    return VERIFIED_COLLEGE_DOMAINS[domain]?.verified || false;
  }

  /**
   * Get college info by domain
   */
  getCollegeInfo(domain: string): CollegeInfo | undefined {
    return VERIFIED_COLLEGE_DOMAINS[domain];
  }

  /**
   * Add new verified college domain (for admin use)
   */
  addVerifiedDomain(domain: string, info: CollegeInfo): void {
    VERIFIED_COLLEGE_DOMAINS[domain] = { ...info, verified: true };
  }
}

// Singleton instance
let verifierInstance: CollegeEmailVerifier | null = null;

export function getCollegeEmailVerifier(): CollegeEmailVerifier {
  if (!verifierInstance) {
    verifierInstance = new CollegeEmailVerifier();
  }
  return verifierInstance;
}

export { CollegeEmailVerifier, EmailVerificationResult, CollegeInfo };
