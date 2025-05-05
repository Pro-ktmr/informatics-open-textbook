import fs from "fs";
import matter from "gray-matter";
import yaml from "js-yaml";
import path from "path";
import remarkParse from "remark-parse";
import { unified } from "unified";
import {
  PageContent,
  PageContents,
  PageType,
  SubjectInfo,
  SubjectYaml,
  UnitInfo,
  UnitYaml,
} from "./models.js";

export const loadPageContents = async (
  markdownDirPath: string
): Promise<PageContents> => {
  const recommendationTreeRoots: string[] = [];
  const recommendationTreeChildren: { [key: string]: string[] } = {};
  const pageContents: PageContents = [];

  const subjectDirs = await fs.promises.readdir(markdownDirPath, {
    withFileTypes: true,
  });
  for (const subjectDir of subjectDirs) {
    if (!subjectDir.isDirectory()) continue;
    const subjectYamlPath = path.join(
      markdownDirPath,
      subjectDir.name,
      "subject.yaml"
    );
    if (!fs.existsSync(subjectYamlPath)) continue;

    const subjectFileContent = fs.readFileSync(subjectYamlPath, "utf8");
    const subjectYaml = yaml.load(subjectFileContent) as SubjectYaml;
    const subjectInfo: SubjectInfo = {
      key: subjectDir.name,
      name: subjectYaml.name,
    };

    const unitDirs = await fs.promises.readdir(
      path.join(markdownDirPath, subjectDir.name),
      { withFileTypes: true }
    );
    for (const unitDir of unitDirs) {
      if (!unitDir.isDirectory()) continue;
      const unitYamlPath = path.join(
        markdownDirPath,
        subjectDir.name,
        unitDir.name,
        "unit.yaml"
      );
      if (!fs.existsSync(unitYamlPath)) continue;

      const unitFileContent = fs.readFileSync(unitYamlPath, "utf8");
      const unitYaml = yaml.load(unitFileContent) as UnitYaml;
      const unitInfo: UnitInfo = {
        key: unitDir.name,
        name: unitYaml.name,
        subject: subjectInfo,
      };
      recommendationTreeRoots.push(unitDir.name);
      recommendationTreeChildren[unitDir.name] = unitYaml.recommendation.map(
        (pageKey) => `${subjectDir.name}_${unitDir.name}_${pageKey}`
      );

      const markdownFiles = await fs.promises.readdir(
        path.join(markdownDirPath, subjectDir.name, unitDir.name)
      );
      for (const markdownFile of markdownFiles) {
        if (markdownFile.slice(-3) !== ".md") continue;
        if (markdownFile === "README.md" || markdownFile === "toc.md") continue;

        const markdownFilePath = path.join(
          markdownDirPath,
          subjectDir.name,
          unitDir.name,
          markdownFile
        );
        const key = `${subjectDir.name}_${unitDir.name}_${markdownFile.replace(
          /\.md$/,
          ""
        )}`;
        const markdownFileContent = fs.readFileSync(markdownFilePath, "utf-8");
        const pageContent = parsePageMarkdown(
          subjectInfo,
          unitInfo,
          key,
          markdownFileContent
        );
        pageContents.push(pageContent);
        recommendationTreeChildren[key] = pageContent.recommendations;
      }
    }
  }

  const recommendationVisitedOrder: { [key: string]: number } = {};
  const recommendationVisited = new Set<string>();
  const recommedationDfs = (key: string) => {
    if (recommendationVisited.has(key)) return;
    recommendationVisitedOrder[key] = recommendationVisited.size;
    recommendationVisited.add(key);
    const children = recommendationTreeChildren[key];
    if (children) {
      for (const child of children) {
        recommedationDfs(child);
      }
    }
  };
  for (const unit of recommendationTreeRoots) {
    recommedationDfs(unit);
  }
  pageContents.sort((lhs, rhs) => {
    const lhsOrder = recommendationVisitedOrder[lhs.key];
    const rhsOrder = recommendationVisitedOrder[rhs.key];
    if (lhsOrder == null) return 1;
    if (rhsOrder == null) return -1;
    return lhsOrder - rhsOrder;
  });

  return pageContents;
};

const parsePageMarkdown = (
  subjectInfo: SubjectInfo,
  unitInfo: UnitInfo,
  key: string,
  markdownContent: string
): PageContent => {
  const parsed = matter(markdownContent);

  const title = getPageTitleFromMarkdownContent(parsed.content);
  const type = ((): PageType => {
    switch (parsed.data.type) {
      case "knowledge":
        return PageType.Knowledge;
      case "activity":
        return PageType.Activity;
      case "q-and-a":
        return PageType.QandA;
      default:
        return PageType.Other;
    }
  })();
  const abstract: string = parsed.data.abstract ?? "";
  const content = parsed.content;
  const recommendations = ((parsed.data.recommendation ?? []) as string[]).map(
    (recommendation) => `${subjectInfo.key}_${unitInfo.key}_${recommendation}`
  );

  return {
    key,
    title,
    type,
    abstract,
    content,
    unit: unitInfo,
    recommendations,
  };
};

const getPageTitleFromMarkdownContent = (markdownContent: string): string => {
  const tree = unified().use(remarkParse).parse(markdownContent);

  for (const node of tree.children) {
    if (node.type === "heading" && node.depth === 1) {
      return node.children
        .filter((child: any) => child.type === "text")
        .map((child: any) => child.value)
        .join("");
    }
  }

  return "Untitled";
};
