export type SubjectYaml = {
  name: string;
};

export type SubjectInfo = {
  key: string;
  name: string;
};

export type UnitYaml = {
  name: string;
  recommendation: string[];
};

export type UnitInfo = {
  key: string;
  name: string;
  subject: SubjectInfo;
};

export const PageType = {
  Knowledge: 0,
  Activity: 1,
  Other: 2,
} as const;
export type PageType = (typeof PageType)[keyof typeof PageType];
export const isPageType = (value: any): value is PageType => {
  return Object.values(PageType).includes(value);
};

export type PageContent = {
  key: string;
  title: string;
  type: PageType;
  abstract: string;
  content: string;
  unit: UnitInfo;
};

export type PageContents = PageContent[];
