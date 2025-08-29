import { http } from "@/utils/http";

/**
 * DictDTO
 */
export interface DictDTO {
  dictType?: string;
  value?: string;
  label?: string;
}

export function getDictListApi(dictType: string) {
  return http.request<ResponseData<Array<DictDTO>>>("get", `/dict/${dictType}`);
}
