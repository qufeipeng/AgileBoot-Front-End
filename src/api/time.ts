import { http } from "@/utils/http";

export interface WorkTimeListCommand extends BasePageQuery {
  pocId?: number;
  customer?: string;
  project?: string;
  deptId?: number;
  userId?: number;
  beginDate?: string;
  endDate?: string;
}

export interface WorkTimePageResponse {
  workTimeId: number;
  pocId?: number;
  customer?: string;
  project?: string;
  deptId?: number;
  deptName?: string;
  userId?: number;
  nickname?: string;
  workHours?: number;
  workContent?: string;
  beginDate?: Date;
  endDate?: Date;
}

export function getWorkTimeListApi(params: WorkTimeListCommand) {
  return http.request<ResponseData<PageDTO<WorkTimePageResponse>>>(
    "get",
    "/time/list",
    {
      params
    }
  );
}

export const exportWorkTimeExcelApi = (
  params: WorkTimeListCommand,
  fileName: string
) => {
  return http.download("/time/excel", fileName, {
    params
  });
};

export interface AddWorkTimeCommand {
  pocId?: number;
  userId?: number;
  workHours?: number;
  workContent?: string;
  beginDate?: Date;
  endDate?: Date;
}

export const addWorkTimeApi = (data: AddWorkTimeCommand) => {
  return http.request<ResponseData<void>>("post", "/time", {
    data
  });
};

export interface UpdateWorkTimeCommand extends AddWorkTimeCommand {
  pocId: number;
}

export const deleteWorkTimeApi = (workTimeId: number) => {
  return http.request<ResponseData<void>>("delete", `/time/${workTimeId}`);
};

export const updateWorkTimeApi = (
  workTimeId: number,
  data?: UpdateWorkTimeCommand
) => {
  return http.request<ResponseData<void>>("put", `/time/${workTimeId}`, {
    data
  });
};
