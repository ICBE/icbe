import { GITLAB_ACCESS_TOKEN, GITLAB_PROJECT_ID } from "astro:env/server";
import { type CommitAction, Gitlab } from "@gitbeaker/rest";
import type * as z from "astro/zod";
import {
  type DataDisproven,
  type DataProven,
  type ElementsHistory,
  type Metadata,
  schemas,
} from "#schemas";

const BRANCH = "main" as const;
const BASE_DATA_DIR = "base-elements/data" as const;

const api = new Gitlab({ token: GITLAB_ACCESS_TOKEN });

type SchemaMap = typeof schemas;
type SchemaKey = keyof SchemaMap;
type OutputSchema<T extends SchemaKey> = z.infer<SchemaMap[T]>;

async function getGitlabFileData<TKey extends SchemaKey>(
  key: TKey,
): Promise<OutputSchema<TKey>> {
  const fileContent = await api.RepositoryFiles.showRaw(
    GITLAB_PROJECT_ID,
    `${BASE_DATA_DIR}/${key}.json`,
    BRANCH,
  );

  const data: unknown = JSON.parse(fileContent as string);
  return schemas[key].parse(data) as OutputSchema<TKey>;
}

export async function getElementsMetadata(): Promise<Metadata> {
  const data = getGitlabFileData("meta");
  return data;
}

export async function getElementsHistory(): Promise<ElementsHistory> {
  const data = getGitlabFileData("history");
  return data;
}

export async function getDisprovenData(): Promise<DataDisproven> {
  const data = getGitlabFileData("disproven");
  return data;
}

export async function getProvenData(): Promise<DataProven> {
  const data = getGitlabFileData("proven");
  return data;
}

function getUpdateAction<TKey extends SchemaKey>(
  type: TKey,
  data: OutputSchema<TKey>,
): CommitAction {
  const filePath = `${BASE_DATA_DIR}/${type}.json`;
  const stringifiedData = JSON.stringify(data, null, 2);
  const content = `${stringifiedData}\n`;
  return { action: "update", filePath, content };
}

export interface SaveToCloudData {
  elements:
    | { type: "proven"; data: DataProven }
    | { type: "disproven"; data: DataDisproven };
  metadata: Metadata;
  history: ElementsHistory;
}

export async function saveToCloud(data: SaveToCloudData) {
  const actions: CommitAction[] = [
    getUpdateAction(data.elements.type, data.elements.data),
    getUpdateAction("meta", data.metadata),
    getUpdateAction("history", data.history),
  ];

  const message = "Updated data";

  await api.Commits.create(GITLAB_PROJECT_ID, BRANCH, message, actions);
}
