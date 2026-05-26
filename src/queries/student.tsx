export type Student = {
  studentId: number;
  countryId: number;
  provinceId: number;
  studentTypeId: string;

  passwordChanged: boolean;
  sex: string;

  firstName: string;
  lastName: string;

  numLogins: number;
  lastLogin: string | null;
  expiry: string | null;

  emailAddress: string;

  arrears: boolean;

  forumUsername: string;
  apiUsername: number;

  questionnaire: boolean;
  videoViewed: boolean;
  ajaxUploads: boolean;
  upgradeNotification: boolean;

  entityVersion: number;

  created: string;
  modified: string;

  hasCASocialInsuranceNumber: boolean;

  country: {
    countryId: number;
    code: string;
    name: string;
    entityVersion: number;
  };

  province: {
    provinceId: number;
    countryId: number;
    regionId: number | null;
    code: string;
    name: string;
    regionCode: string | null;
    alternateAbbreviation: string | null;
    type: string;
    entityVersion: number;
  };

  enrollments: {
    enrollmentId: number;
    courseId: number;
    studentId: number;
    studentNumber: number;
    tutorId: number;

    maxAssignments: number | null;

    graduated: boolean;

    assignmentsDisabled: boolean;
    quizzesDisabled: boolean;

    onHold: boolean;
    holdReason: string | null;

    currencyCode: string;

    courseCost: number;
    amountPaid: number;

    monthlyInstallment: number | null;

    enrollmentDate: string | null;
    dueDate: string | null;

    fastTrack: boolean;

    paymentsDisabled: boolean;

    updated: string;

    entityVersion: number;

    course: {
      courseId: number;
      schoolId: number;
      variantId: number | null;

      code: string;
      version: number;

      studentTypeId: string;

      name: string;
      subheading: string | null;

      courseGuide: boolean;
      quizzesEnabled: boolean;
      noTutor: boolean;

      submissionType: number;

      enabled: boolean;
      order: number;

      submissionsEnabled: boolean;

      entityVersion: number;

      school: {
        schoolId: number;
        name: string;
        slug: string;
        order: number;
        entityVersion: number;
      };

      variant: null;
    };
  }[];

  surveyCompletions: unknown[];
};