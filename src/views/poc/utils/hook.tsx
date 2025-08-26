import dayjs from "dayjs";
import { message } from "@/utils/message";
import editForm from "../poc-form-modal.vue";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, toRaw, h } from "vue";
import { CommonUtils } from "@/utils/common";
import { addDialog } from "@/components/ReDialog";
import { handleTree, setDisabledForTreeOptions } from "@/utils/tree";
import { getDeptListApi } from "@/api/system/dept";
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
  const searchFormParams = reactive<PocListCommand>({
    customer: undefined,
    project: undefined,
    status: undefined,
    owner: undefined,
    risk: undefined,
    timeRangeColumn: "createTime"
  });

  const formRef = ref();
  const timeRange = ref<[string, string]>();

  const dataList = ref([]);
  const pageLoading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const deptTreeList = ref([]);

  const status = [
    {
      value: "0",
      label: "待启动"
    },
    {
      value: "1",
      label: "POC中"
    },
    {
      value: "2",
      label: "POC暂停"
    },
    {
      value: "3",
      label: "POC完成-待推进"
    },
    {
      value: "4",
      label: "POC完成-取消"
    },
    {
      value: "5",
      label: "上线实施中"
    },
    {
      value: "6",
      label: "已上线"
    },
    {
      value: "7",
      label: "转维护"
    },
    {
      value: "8",
      label: "生态适配中"
    },
    {
      value: "9",
      label: "生态适配完成"
    },
    {
      value: "10",
      label: "取消"
    },
    {
      value: "11",
      label: "其他"
    }
  ];

  const risks = [
    {
      value: "0",
      label: "无风险"
    },
    {
      value: "1",
      label: "低风险"
    },
    {
      value: "2",
      label: "高风险"
    }
  ];

  const columns: TableColumnList = [
    {
      type: "selection",
      align: "left"
    },
    {
      label: "POC编号",
      prop: "pocId",
      minWidth: 100
    },
    {
      label: "项目组",
      prop: "deptName",
      minWidth: 120
    },
    {
      label: "当前责任人",
      prop: "owner",
      minWidth: 120
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 120,
      cellRenderer: ({ row }) => status[row.status].label
    },
    {
      label: "客户名称",
      prop: "customer",
      minWidth: 120
    },
    {
      label: "项目名称",
      prop: "project",
      minWidth: 120
    },
    {
      label: "进度",
      prop: "progress",
      minWidth: 100
    },
    {
      label: "风险",
      prop: "risk",
      minWidth: 120,
      cellRenderer: ({ row }) => risks[row.risk].label
    },
    {
      label: "待处理&风险描述",
      prop: "todo_risk",
      minWidth: 120
    },
    {
      label: "已完成进展",
      prop: "done",
      minWidth: 120
    },
    {
      label: "销售",
      prop: "sales",
      minWidth: 120
    },
    {
      label: "售前",
      prop: "sa",
      minWidth: 120
    },
    {
      label: "poc人员",
      prop: "poc",
      minWidth: 120
    },
    {
      label: "运维",
      prop: "op",
      minWidth: 120
    },
    {
      label: "重点项目",
      prop: "kv",
      minWidth: 120
    },
    {
      label: "开始日期",
      minWidth: 120,
      prop: "pocStartDt",
      sortable: "custom",
      formatter: ({ pocStartDt }) => dayjs(pocStartDt).format("YYYY-MM-DD")
    },
    {
      label: "POC完成日期",
      minWidth: 120,
      prop: "pocEndDt",
      sortable: "custom",
      formatter: ({ pocEndDt }) => dayjs(pocEndDt).format("YYYY-MM-DD")
    },
    {
      label: "上线日期",
      minWidth: 120,
      prop: "onlineDt",
      sortable: "custom",
      formatter: ({ onlineDt }) => dayjs(onlineDt).format("YYYY-MM-DD")
    },
    {
      label: "最后更新日期",
      minWidth: 120,
      prop: "lastUpdDt",
      sortable: "custom",
      formatter: ({ lastUpdDt }) => dayjs(lastUpdDt).format("YYYY-MM-DD")
    },
    {
      label: "省份",
      prop: "province",
      minWidth: 120
    },
    {
      label: "行业",
      prop: "industry",
      minWidth: 120
    },
    {
      label: "ISV",
      prop: "isv",
      minWidth: 120
    },
    {
      label: "运维厂商",
      prop: "maintenance",
      minWidth: 120
    },
    {
      label: "版本号",
      prop: "version",
      minWidth: 120
    },
    {
      label: "部署形态",
      prop: "deployment",
      minWidth: 120
    },
    {
      label: "兼容性需求",
      prop: "compatibility",
      minWidth: 120
    },
    {
      label: "相关组件",
      prop: "plugins",
      minWidth: 120
    },
    {
      label: "备注",
      prop: "notes",
      minWidth: 120
    },
    {
      label: "创建者",
      prop: "creatorName",
      minWidth: 120
    },
    {
      label: "创建时间",
      minWidth: 160,
      prop: "createTime",
      sortable: "custom",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "更新者",
      prop: "updaterName",
      minWidth: 120
    },
    {
      label: "更新时间",
      minWidth: 160,
      prop: "updateTime",
      sortable: "custom",
      formatter: ({ updateTime }) =>
        dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 140,
      slot: "operation"
    }
  ];

  async function exportAllExcel() {
    CommonUtils.fillPaginationParams(searchFormParams, pagination);
    exportPocExcelApi(toRaw(searchFormParams), "POC列表.xls");
  }

  async function handleAdd(row, done) {
    await addPocApi(row as UpdatePocCommand).then(() => {
      message(`您新增了POC${row.project}的这条数据`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      getList();
    });
  }

  async function handleUpdate(row, done) {
    await updatePocApi(row.pocId, row as UpdatePocCommand).then(() => {
      message(`您修改了POC${row.project}的这条数据`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      getList();
    });
  }

  async function handleDelete(row) {
    await deletePocApi(row.pocId).then(() => {
      message(`您删除了POC${row.project}的这条数据`, { type: "success" });
      // 刷新列表
      getList();
    });
  }

  async function onSearch() {
    // 点击搜索的时候 需要重置分页
    pagination.currentPage = 1;
    getList();
  }

  async function openDialog(title = "新增", row?: UpdatePocCommand) {
    // TODO 如果是编辑的话  通过获取POC详情接口来获取数据
    addDialog({
      title: `${title}POC`,
      props: {
        formInline: {
          pocId: row?.pocId ?? 0,
          owner: row?.owner ?? useUserStoreHook().username,
          status: row?.status ?? "",
          customer: row?.customer ?? "",
          project: row?.project ?? "",
          progress: row?.progress ?? 0,
          risk: row?.risk ?? "",
          todo_risk: row?.todo_risk ?? "",
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
          plugins: row?.plugins ?? "",
          notes: row?.notes ?? "",
          deptId: row?.deptId ?? useUserStoreHook().deptId
        },
        deptOptions: deptTreeList,
        statusOptions: status,
        riskOptions: risks
      },

      width: "60%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
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

  async function getList() {
    CommonUtils.fillPaginationParams(searchFormParams, pagination);
    CommonUtils.fillTimeRangeParams(searchFormParams, timeRange.value);

    pageLoading.value = true;
    const { data } = await getPocListApi(toRaw(searchFormParams)).finally(
      () => {
        pageLoading.value = false;
      }
    );

    dataList.value = data.rows;
    pagination.total = data.total;
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  onMounted(async () => {
    onSearch();
    const deptResponse = await getDeptListApi();
    deptTreeList.value = await setDisabledForTreeOptions(
      handleTree(deptResponse.data),
      "status"
    );
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
    resetForm,
    handleUpdate,
    getList,
    handleDelete,
    status,
    risks
  };
}
