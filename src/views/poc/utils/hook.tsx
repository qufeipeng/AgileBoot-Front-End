import dayjs from "dayjs";
import { message } from "@/utils/message";
import { Sort } from "element-plus";
import editForm from "../poc-form-modal.vue";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, toRaw, h, computed } from "vue";
import { CommonUtils } from "@/utils/common";
import { addDialog } from "@/components/ReDialog";
//import { handleTree, setDisabledForTreeOptions } from "@/utils/tree";
//import { getDeptAndUserListApi } from "@/api/system/dept";
import { getUserList2Api } from "@/api/system/user";
import { getDictListApi } from "@/api/dict";
import {
  PocListCommand,
  getPocListApi,
  exportPocExcelApi,
  deletePocApi,
  addPocApi,
  updatePocApi,
  UpdatePocCommand
} from "@/api/poc";
import { useUserStoreHook } from "@/store/modules/user";

export function useHook() {
  const defaultSort: Sort = {
    prop: "createTime",
    //order: "ascending"
    order: "descending"
  };

  const searchFormParams = reactive<PocListCommand>({
    pocId: undefined,
    customer: undefined,
    project: undefined,
    status: undefined,
    owner: undefined,
    poc: undefined,
    risk: undefined,
    beginPocStartDt: undefined,
    endPocStartDt: undefined,
    beginPocEndDt: undefined,
    endPocEndDt: undefined,
    beginOnlineDt: undefined,
    endOnlineDt: undefined,
    timeRangeColumn: "pocStartDt"
  });

  const formRef = ref();
  const pocStartDtTimeRange = computed<[string, string] | null>({
    get() {
      if (searchFormParams.beginPocStartDt && searchFormParams.endPocStartDt) {
        return [
          searchFormParams.beginPocStartDt,
          searchFormParams.endPocStartDt
        ];
      } else {
        return null;
      }
    },
    set(v) {
      if (v?.length === 2) {
        searchFormParams.beginPocStartDt = v[0];
        searchFormParams.endPocStartDt = v[1];
      } else {
        searchFormParams.beginPocStartDt = undefined;
        searchFormParams.endPocStartDt = undefined;
      }
    }
  });

  const pocEndDtTimeRange = computed<[string, string] | null>({
    get() {
      if (searchFormParams.beginPocEndDt && searchFormParams.endPocEndDt) {
        return [searchFormParams.beginPocEndDt, searchFormParams.endPocEndDt];
      } else {
        return null;
      }
    },
    set(v) {
      if (v?.length === 2) {
        searchFormParams.beginPocEndDt = v[0];
        searchFormParams.endPocEndDt = v[1];
      } else {
        searchFormParams.beginPocEndDt = undefined;
        searchFormParams.endPocEndDt = undefined;
      }
    }
  });

  const onlineDtTimeRange = computed<[string, string] | null>({
    get() {
      if (searchFormParams.beginOnlineDt && searchFormParams.endOnlineDt) {
        return [searchFormParams.beginOnlineDt, searchFormParams.endOnlineDt];
      } else {
        return null;
      }
    },
    set(v) {
      if (v?.length === 2) {
        searchFormParams.beginOnlineDt = v[0];
        searchFormParams.endOnlineDt = v[1];
      } else {
        searchFormParams.beginPocStartDt = undefined;
        searchFormParams.endOnlineDt = undefined;
      }
    }
  });

  const dataList = ref([]);
  const pageLoading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const sortState = ref<Sort>(defaultSort);

  //const deptTreeList = ref([]);

  const userList = ref([]);

  const status = ref([]);

  const risks = ref([]);

  const industrys = ref([]);

  const deployments = ref([]);

  const compatibilitys = ref([]);

  const provinces = ref([]);

  const plugins = ref([]);

  //const isDisabled = ref(false);
  //isDisabled.value = useUserStoreHook().roles[0] != "admin";

  const columns: TableColumnList = [
    // {
    //   type: "selection",
    //   align: "left"
    // },
    {
      label: "POC编号",
      prop: "pocId",
      minWidth: 130
    },
    {
      label: "项目组",
      prop: "deptName",
      minWidth: 100
    },
    {
      label: "当前责任人",
      prop: "ownerUsername",
      minWidth: 100
    },
    {
      label: "状态",
      prop: "statusName",
      minWidth: 100
      // cellRenderer: ({ row }) => status[row.status]?.label ?? ""
    },
    {
      label: "客户名称",
      prop: "customer",
      minWidth: 100
    },
    {
      label: "项目名称",
      prop: "project",
      minWidth: 100
    },
    {
      label: "进度",
      prop: "progress",
      minWidth: 100,
      cellRenderer: ({ row }) => row.progress + "%"
    },
    {
      label: "风险",
      prop: "riskName",
      minWidth: 100
      // cellRenderer: ({ row }) => risks[row.risk]?.label ?? ""
    },
    {
      label: "待处理&风险描述",
      prop: "todoRisk",
      minWidth: 100,
      cellRenderer: truncateRenderer
    },
    {
      label: "已完成进展",
      prop: "done",
      minWidth: 100,
      cellRenderer: truncateRenderer
    },
    {
      label: "销售",
      prop: "sales",
      minWidth: 100
    },
    {
      label: "售前",
      prop: "sa",
      minWidth: 100
    },
    // {
    //   label: "POC人员ID",
    //   prop: "poc",
    //   minWidth: 100,
    //   hide: true
    // },
    {
      label: "POC人员",
      prop: "pocUsername",
      minWidth: 100
    },
    {
      label: "运维",
      prop: "op",
      minWidth: 100
    },
    {
      label: "重点项目",
      prop: "kv",
      minWidth: 100
    },
    {
      label: "开始日期",
      minWidth: 100,
      prop: "pocStartDt",
      sortable: "custom",
      formatter: ({ pocStartDt }) =>
        pocStartDt ? dayjs(pocStartDt).format("YYYY-MM-DD") : ""
    },
    {
      label: "完成日期",
      minWidth: 100,
      prop: "pocEndDt",
      sortable: "custom",
      formatter: ({ pocEndDt }) =>
        pocEndDt ? dayjs(pocEndDt).format("YYYY-MM-DD") : ""
    },
    {
      label: "上线日期",
      minWidth: 100,
      prop: "onlineDt",
      sortable: "custom",
      formatter: ({ onlineDt }) =>
        onlineDt ? dayjs(onlineDt).format("YYYY-MM-DD") : ""
    },
    {
      label: "最后更新日期",
      minWidth: 100,
      prop: "lastUpdDt",
      sortable: "custom",
      formatter: ({ lastUpdDt }) =>
        lastUpdDt ? dayjs(lastUpdDt).format("YYYY-MM-DD") : ""
    },
    {
      label: "省份",
      prop: "provinceName",
      minWidth: 100
      // cellRenderer: ({ row }) => provinces[row.province]?.label ?? ""
    },
    {
      label: "行业",
      prop: "industryName",
      minWidth: 100
      // cellRenderer: ({ row }) => industrys[row.industry]?.label ?? ""
    },
    {
      label: "ISV",
      prop: "isv",
      minWidth: 100
    },
    {
      label: "运维厂商",
      prop: "maintenance",
      minWidth: 100
    },
    {
      label: "版本号",
      prop: "version",
      minWidth: 100
    },
    {
      label: "部署形态",
      prop: "deploymentName",
      minWidth: 100
      // cellRenderer: ({ row }) => deployments[row.deployment]?.label ?? ""
    },
    {
      label: "兼容性需求",
      prop: "compatibilityName",
      minWidth: 100
      // cellRenderer: ({ row }) => compatibilitys[row.compatibility]?.label ?? ""
    },
    {
      label: "相关组件",
      prop: "pluginsName",
      minWidth: 100
    },
    {
      label: "备注",
      prop: "notes",
      minWidth: 100,
      cellRenderer: truncateRenderer
    },
    {
      label: "创建者",
      prop: "creatorName",
      minWidth: 100
    },
    {
      label: "创建时间",
      minWidth: 160,
      prop: "createTime",
      sortable: "custom",
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : ""
    },
    {
      label: "更新者",
      prop: "updaterName",
      minWidth: 100
    },
    {
      label: "更新时间",
      minWidth: 160,
      prop: "updateTime",
      sortable: "custom",
      formatter: ({ updateTime }) =>
        updateTime ? dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss") : ""
    },
    {
      label: "操作",
      fixed: "right",
      width: 140,
      slot: "operation"
    }
  ];

  function truncateRenderer(scope) {
    // 获取当前单元格的原始值
    const cellValue = scope.row[scope.column.property] || ""; // 或使用 scope.row[prop]
    // 截取前10个字符
    const truncatedText =
      cellValue.length > 10 ? cellValue.substring(0, 10) + "..." : cellValue;

    // 返回一个带有样式（可选）的HTML字符串
    //return `<span title="${cellValue}" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${truncatedText}</span>`;
    //return `${truncatedText}`;

    return h(
      "span",
      {
        style:
          "display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
        title: cellValue // 鼠标悬停提示完整内容
        // 可以添加类名、事件等
        //class: 'truncated-text'
      },
      truncatedText // 作为文本子节点
    );
  }

  async function exportAllExcel() {
    //CommonUtils.fillPaginationParams(searchFormParams, pagination);
    //exportPocExcelApi(toRaw(searchFormParams), "POC列表.xls");

    if (sortState.value != null) {
      CommonUtils.fillSortParams(searchFormParams, sortState.value);
    }
    CommonUtils.fillPaginationParams(searchFormParams, pagination);
    CommonUtils.fillTimeRangeParams(
      searchFormParams,
      pocStartDtTimeRange.value
    );
    CommonUtils.fillTimeRangeParams(searchFormParams, pocEndDtTimeRange.value);
    CommonUtils.fillTimeRangeParams(searchFormParams, onlineDtTimeRange.value);

    exportPocExcelApi(toRaw(searchFormParams), "POC列表.xlsx");
  }

  async function handleAdd(row, done) {
    row.plugins = row.plugins.join(",");
    await addPocApi(row as UpdatePocCommand).then(() => {
      message(`您新增了POC${row.project} 的这条数据`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      getPocList();
    });
  }

  async function handleUpdate(row, done) {
    row.plugins = row.plugins.join(",");
    await updatePocApi(row.pocId, row as UpdatePocCommand).then(() => {
      message(`您修改了POC${row.project} 的这条数据`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      getPocList();
    });
  }

  async function handleDelete(row) {
    await deletePocApi(row.pocId).then(() => {
      message(`您删除了POC${row.project} 的这条数据`, { type: "success" });
      // 刷新列表
      getPocList();
    });
  }

  function onSortChanged(sort: Sort) {
    sortState.value = sort;
    // 表格列的排序变化的时候，需要重置分页
    pagination.currentPage = 1;
    getPocList();
  }

  async function onWatch() {
    // 点击搜索的时候 需要重置分页
    pagination.currentPage = 1;
    getPocList();
  }

  async function onSearch(tableRef) {
    // 点击搜索的时候 需要重置分页
    //pagination.currentPage = 1;
    //getList();
    // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
    tableRef.getTableRef().sort("createTime", "descending");
  }

  async function openDialog(title = "新增", row?: UpdatePocCommand) {
    // TODO 如果是编辑的话  通过获取POC详情接口来获取数据
    addDialog({
      title: `${title} POC`,
      props: {
        formInline: {
          pocId: row?.pocId ?? undefined,
          owner: row?.owner ?? useUserStoreHook().userId,
          status: row?.status ?? "",
          customer: row?.customer ?? "",
          project: row?.project ?? "",
          progress: row?.progress ?? 0,
          risk: row?.risk ?? "",
          todoRisk: row?.todoRisk ?? "",
          done: row?.done ?? "",
          sales: row?.sales ?? "",
          sa: row?.sa ?? "",
          poc: row?.poc ?? "",
          op: row?.op ?? "",
          kv: row?.kv ?? "",
          pocStartDt: row?.pocStartDt ?? undefined,
          pocEndDt: row?.pocEndDt ?? undefined,
          onlineDt: row?.onlineDt ?? undefined,
          lastUpdDt: row?.lastUpdDt ?? undefined,
          province: row?.province ?? "",
          industry: row?.industry ?? "",
          isv: row?.isv ?? "",
          maintenance: row?.maintenance ?? "",
          version: row?.version ?? "",
          deployment: row?.deployment ?? "",
          compatibility: row?.compatibility ?? "",
          plugins: row?.plugins?.split(",") ?? "",
          notes: row?.notes ?? ""
          //deptId: row?.deptId ?? useUserStoreHook().deptId
        },
        //deptOptions: deptTreeList,
        statusOptions: status,
        riskOptions: risks,
        userOptions: userList,
        //userOptions: deptTreeList,
        provinceOptions: provinces,
        industryOptions: industrys,
        deploymentOptions: deployments,
        compatibilityOptions: compatibilitys,
        pluginsOptions: plugins
        //isDisabled: isDisabled
      },

      width: "70%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      alignCenter: true,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const formRuleRef = formRef.value.getFormRuleRef();
        const curData = options.props.formInline as UpdatePocCommand;

        formRuleRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            if (title === "新增") {
              handleAdd(curData, done);
            } else {
              handleUpdate(curData, done);
            }
          }
        });
      }
    });
  }

  async function getPocList() {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, pagination);
    //CommonUtils.fillTimeRangeParams(searchFormParams, timeRange.value);

    pageLoading.value = true;
    const { data } = await getPocListApi(toRaw(searchFormParams)).finally(
      () => {
        pageLoading.value = false;
      }
    );

    dataList.value = data.rows;
    pagination.total = data.total;
  }

  function resetForm(formEl, tableRef) {
    if (!formEl) return;
    formEl.resetFields();
    // 清空时间查询  TODO  这块有点繁琐  有可以优化的地方吗？
    // Form组件的resetFields方法无法清除datepicker里面的数据。
    searchFormParams.beginPocStartDt = undefined;
    searchFormParams.endPocStartDt = undefined;
    searchFormParams.beginPocEndDt = undefined;
    searchFormParams.endPocEndDt = undefined;
    searchFormParams.beginOnlineDt = undefined;
    searchFormParams.endOnlineDt = undefined;
    onSearch(tableRef);
  }

  onMounted(async () => {
    //onSearch();
    getPocList();

    // const deptResponse = await getDeptAndUserListApi({});
    // deptTreeList.value = await setDisabledForTreeOptions(
    //   handleTree(deptResponse.data),
    //   "status"
    // );

    const userResponse = await getUserList2Api({});
    userList.value = userResponse.data;

    const statusResponse = await getDictListApi("status");
    status.value = statusResponse.data;

    const risksResponse = await getDictListApi("risk");
    risks.value = risksResponse.data;

    const industrysResponse = await getDictListApi("industry");
    industrys.value = industrysResponse.data;

    const deploymentsResponse = await getDictListApi("deployment");
    deployments.value = deploymentsResponse.data;

    const compatibilitysResponse = await getDictListApi("compatibility");
    compatibilitys.value = compatibilitysResponse.data;

    const provincesResponse = await getDictListApi("province");
    provinces.value = provincesResponse.data;

    const pluginsResponse = await getDictListApi("plugins");
    plugins.value = pluginsResponse.data;
  });

  return {
    searchFormParams,
    pageLoading,
    columns,
    dataList,
    pagination,
    onSearch,
    openDialog,
    exportAllExcel,
    pocStartDtTimeRange,
    pocEndDtTimeRange,
    onlineDtTimeRange,
    defaultSort,
    onSortChanged,
    resetForm,
    handleUpdate,
    getPocList,
    handleDelete,
    status,
    risks,
    userList,
    onWatch
  };
}
