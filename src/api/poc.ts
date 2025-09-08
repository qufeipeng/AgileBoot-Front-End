import { http } from "@/utils/http";

export interface PocListCommand extends BasePageQuery {
  pocId?: number;
  customer?: string;
  project?: string;
  deptId?: string;
  status?: string;
  owner?: number;
  poc?: number;
  risk?: string;
  beginPocStartDt?: string;
  endPocStartDt?: string;
  beginPocEndDt?: string;
  endPocEndDt?: string;
  beginOnlineDt?: string;
  endOnlineDt?: string;
}

export interface PocPageResponse {
  pocId: number;
  owner: number;
  ownerUsername: string;
  status: string;
  statusName: string;
  customer: string;
  project: string;
  progress: number;
  risk: string;
  riskName: string;
  todoRisk: string;
  done: string;
  sales: string;
  sa: number;
  saUsername: string;
  poc: number;
  pocUsername: string;
  op: string;
  kv: string;
  pocStartDt: Date;
  pocEndDt: Date;
  onlineDt: Date;
  lastUpdDt: Date;
  province: string;
  provinceName: string;
  industry: string;
  industryName: string;
  isv: string;
  maintenance: string;
  version: string;
  deployment: string;
  deploymentName: string;
  compatibility: string;
  plugins: string;
  pluginsName: string;
  notes: string;
  deptId: number;
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

export function getPocListAllApi(params: PocListCommand) {
  return http.request<ResponseData<Array<PocPageResponse>>>(
    "get",
    "/poc/listAll",
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

export interface AddPocCommand {
  owner: string;
  status: string;
  customer: string;
  project: string;
  progress: number;
  risk: string;
  todoRisk: string;
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
  //deptId: number;
}

export const addPocApi = (data: AddPocCommand) => {
  return http.request<ResponseData<void>>("post", "/poc", {
    data
  });
};

export interface UpdatePocCommand extends AddPocCommand {
  pocId: number;
}

export const deletePocApi = (pocId: number) => {
  return http.request<ResponseData<void>>("delete", `/poc/${pocId}`);
};

export const updatePocApi = (pocId: number, data?: UpdatePocCommand) => {
  return http.request<ResponseData<void>>("put", `/poc/${pocId}`, {
    data
  });
};
