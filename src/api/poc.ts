import { http } from "@/utils/http";

export interface PocListCommand extends BasePageQuery {
  customer?: string;
  project?: string;
  status?: string;
  owner?: string;
  risk?: string;
}

export interface PocPageResponse {
  pocId: number;
  owner: string;
  status: string;
  customer: string;
  project: string;
  progress: number;
  risk: string;
  todo_risk: string;
  done: string;
  sales: string;
  sa: string;
  poc: string;
  op: string;
  kv: string;
  pocStartDt: Date;
  pocEndDt: Date;
  onlineDt: Date;
  lastUpdDt: Date;
  province: string;
  industry: string;
  isv: string;
  maintenance: string;
  version: string;
  deployment: string;
  compatibility: string;
  plugins: string;
  notes: string;
  deptName: string;
  creatorName: string;
  createTime: Date;
  updaterName: string;
  updateTime: Date;
}

export function getPocListApi(params: PocListCommand) {
  return http.request<ResponseData<PageDTO<PocPageResponse>>>(
    "get",
    "/poc/list",
    {
      params
    }
  );
}

export const exportPocExcelApi = (params: PocListCommand, fileName: string) => {
  return http.download("/poc/excel", fileName, {
    params
  });
};

export const deletePocApi = (data: Array<number>) => {
  return http.request<ResponseData<void>>("delete", "/poc", {
    params: {
      // 需要将数组转换为字符串  否则Axios会将参数变成 noticeIds[0]:1  noticeIds[1]:2 这种格式，后端接收参数不成功
      ids: data.toString()
    }
  });
};

export interface AddPocCommand {
  owner: string;
  status: string;
  customer: string;
  project: string;
  progress: number;
  risk: string;
  todo_risk: string;
  done: string;
  sales: string;
  sa: string;
  poc: string;
  op: string;
  kv: string;
  pocStartDt: Date;
  pocEndDt: Date;
  onlineDt: Date;
  lastUpdDt: Date;
  province: string;
  industry: string;
  isv: string;
  maintenance: string;
  version: string;
  deployment: string;
  compatibility: string;
  plugins: string;
  notes: string;
  deptId: number;
}

export const addPocApi = (data: AddPocCommand) => {
  return http.request<ResponseData<void>>("post", "/poc", {
    data
  });
};

export interface UpdatePocCommand extends AddPocCommand {
  pocId: number;
}

export const updatePocApi = (pocId: number, data?: UpdatePocCommand) => {
  return http.request<ResponseData<void>>("put", `/poc/${pocId}`, {
    data
  });
};
