interface CollegeData {
  department: string;
  courses: string[];
  academicYear: string;
  semester: string;
  advisor?: string;
  gpa?: number;
}

interface UniversityInfo {
  email: string;
  universityName: string;
  universityId: string;
  program: string;
  yearOfStudy: string;
}

class CollegeDataService {
  
  // Simulate fetching college data from university systems
  // In a real implementation, this would integrate with university APIs
  async fetchCollegeData(userInfo: UniversityInfo): Promise<CollegeData | null> {
    try {
      // Extract university domain for routing to correct system
      const emailDomain = userInfo.email.split('@')[1];
      
      // Simulate different university systems
      switch (emailDomain.toLowerCase()) {
        case 'harvard.edu':
        case 'student.harvard.edu':
          return this.fetchHarvardData(userInfo);
          
        case 'mit.edu':
        case 'student.mit.edu':
          return this.fetchMITData(userInfo);
          
        case 'stanford.edu':
        case 'student.stanford.edu':
          return this.fetchStanfordData(userInfo);
          
        default:
          return this.fetchGenericUniversityData(userInfo);
      }
    } catch (error) {
      console.error('Error fetching college data:', error);
      return null;
    }
  }

  private async fetchHarvardData(userInfo: UniversityInfo): Promise<CollegeData> {
    // Simulate Harvard University API call
    await this.simulateAPIDelay();
    
    const departmentMap = {
      'computer science': 'Computer Science',
      'engineering': 'Engineering and Applied Sciences',
      'business': 'Harvard Business School',
      'medicine': 'Harvard Medical School',
      'law': 'Harvard Law School'
    };

    const courseMap = {
      'computer science': ['CS50', 'CS51', 'CS61', 'CS124', 'CS171'],
      'engineering': ['ES50', 'AM10', 'ES51', 'CS50', 'MATH21'],
      'business': ['BUSI101', 'ACCT501', 'FINA601', 'MKTG501', 'OPER601'],
      'medicine': ['MED101', 'ANAT201', 'PHYS301', 'PATH401', 'CLIN501'],
      'law': ['LAW101', 'CONS201', 'TORTS301', 'CORP401', 'CRIM501']
    };

    const programKey = userInfo.program.toLowerCase();
    const department = departmentMap[programKey] || 'General Studies';
    const courses = courseMap[programKey] || ['GEN101', 'GEN201', 'GEN301'];

    return {
      department,
      courses: courses.slice(0, Math.min(parseInt(userInfo.yearOfStudy) + 2, courses.length)),
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      semester: this.getCurrentSemester(),
      advisor: this.generateAdvisorName(),
      gpa: this.generateGPA()
    };
  }

  private async fetchMITData(userInfo: UniversityInfo): Promise<CollegeData> {
    // Simulate MIT API call
    await this.simulateAPIDelay();
    
    const departmentMap = {
      'computer science': 'Electrical Engineering and Computer Science',
      'engineering': 'Mechanical Engineering',
      'physics': 'Physics',
      'mathematics': 'Mathematics',
      'chemistry': 'Chemistry'
    };

    const courseMap = {
      'computer science': ['6.001', '6.002', '6.034', '6.046', '6.006'],
      'engineering': ['2.001', '2.003', '2.005', '2.007', '2.009'],
      'physics': ['8.01', '8.02', '8.03', '8.04', '8.05'],
      'mathematics': ['18.01', '18.02', '18.03', '18.06', '18.700'],
      'chemistry': ['5.111', '5.112', '5.13', '5.60', '5.61']
    };

    const programKey = userInfo.program.toLowerCase();
    const department = departmentMap[programKey] || 'General Institute Requirements';
    const courses = courseMap[programKey] || ['GIR.01', 'GIR.02', 'GIR.03'];

    return {
      department,
      courses: courses.slice(0, Math.min(parseInt(userInfo.yearOfStudy) + 2, courses.length)),
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      semester: this.getCurrentSemester(),
      advisor: this.generateAdvisorName(),
      gpa: this.generateGPA()
    };
  }

  private async fetchStanfordData(userInfo: UniversityInfo): Promise<CollegeData> {
    // Simulate Stanford API call
    await this.simulateAPIDelay();
    
    const departmentMap = {
      'computer science': 'Computer Science',
      'engineering': 'Engineering',
      'business': 'Graduate School of Business',
      'medicine': 'School of Medicine',
      'education': 'Graduate School of Education'
    };

    const courseMap = {
      'computer science': ['CS106A', 'CS106B', 'CS107', 'CS110', 'CS161'],
      'engineering': ['ENGR40M', 'ENGR76', 'CS106A', 'MATH51', 'PHYS41'],
      'business': ['OB374', 'ACCT341', 'FIN560', 'MKTG365', 'OIT262'],
      'medicine': ['MED201', 'ANES201', 'DERM240', 'EMED324', 'NEUR260'],
      'education': ['EDUC115', 'EDUC200', 'EDUC301', 'EDUC402', 'EDUC503']
    };

    const programKey = userInfo.program.toLowerCase();
    const department = departmentMap[programKey] || 'Undergraduate Education';
    const courses = courseMap[programKey] || ['PWR1', 'THINK', 'WAYS'];

    return {
      department,
      courses: courses.slice(0, Math.min(parseInt(userInfo.yearOfStudy) + 2, courses.length)),
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      semester: this.getCurrentSemester(),
      advisor: this.generateAdvisorName(),
      gpa: this.generateGPA()
    };
  }

  private async fetchGenericUniversityData(userInfo: UniversityInfo): Promise<CollegeData> {
    // Generic university data for other institutions
    await this.simulateAPIDelay();

    const genericCourses = [
      'ENG101', 'MATH101', 'SCI101', 'HIST101', 'ART101',
      'ENG201', 'MATH201', 'SCI201', 'HIST201', 'ART201',
      'ENG301', 'MATH301', 'SCI301', 'HIST301', 'ART301'
    ];

    return {
      department: userInfo.program || 'General Studies',
      courses: genericCourses.slice(0, Math.min(parseInt(userInfo.yearOfStudy) * 2 + 1, genericCourses.length)),
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      semester: this.getCurrentSemester(),
      advisor: this.generateAdvisorName(),
      gpa: this.generateGPA()
    };
  }

  private getCurrentSemester(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 5) {
      return 'Spring';
    } else if (month >= 6 && month <= 8) {
      return 'Summer';
    } else {
      return 'Fall';
    }
  }

  private generateAdvisorName(): string {
    const firstNames = ['Dr. Sarah', 'Prof. Michael', 'Dr. Emily', 'Prof. David', 'Dr. Jennifer', 'Prof. Robert'];
    const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  private generateGPA(): number {
    // Generate a realistic GPA between 2.5 and 4.0
    return Math.round((Math.random() * 1.5 + 2.5) * 100) / 100;
  }

  private async simulateAPIDelay(): Promise<void> {
    // Simulate network delay for realistic API call
    return new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }

  // Validate university email domain
  isValidUniversityEmail(email: string): boolean {
    const universityDomains = [
      'harvard.edu', 'student.harvard.edu',
      'mit.edu', 'student.mit.edu',
      'stanford.edu', 'student.stanford.edu',
      'berkeley.edu', 'student.berkeley.edu',
      'yale.edu', 'student.yale.edu',
      'princeton.edu', 'student.princeton.edu',
      'columbia.edu', 'student.columbia.edu',
      'upenn.edu', 'student.upenn.edu',
      '.edu' // General .edu domain check
    ];

    return universityDomains.some(domain => 
      email.toLowerCase().endsWith(domain) || 
      email.toLowerCase().includes('.edu')
    );
  }
}

// Singleton instance
let collegeDataServiceInstance: CollegeDataService | null = null;

export function getCollegeDataService(): CollegeDataService {
  if (!collegeDataServiceInstance) {
    collegeDataServiceInstance = new CollegeDataService();
  }
  return collegeDataServiceInstance;
}

export { CollegeDataService, CollegeData, UniversityInfo };
