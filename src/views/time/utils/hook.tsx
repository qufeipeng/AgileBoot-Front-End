import dayjs from "dayjs";
import { message } from "@/utils/message";
import { Sort } from "element-plus";
import editForm from "../time-form-modal.vue";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, toRaw, h } from "vue";
import { CommonUtils } from "@/utils/common";
import { addDialog } from "@/components/ReDialog";
import { handleTree, setDisabledForTreeOptions } from "@/utils/tree";
import { getDeptListApi } from "@/api/system/dept";
import { getUserListNoPageApi } from "@/api/system/user";
import {
  WorkTimeListCommand,
  UpdateWorkTimeCommand,
  getWorkTimeListApi,
  exportWorkTimeExcelApi,
  addWorkTimeApi,
  updateWorkTimeApi,
  deleteWorkTimeApi
} from "@/api/time";
import { getPocListAllApi } from "@/api/poc";
import { useUserStoreHook } from "@/store/modules/user";

export function useHook() {
  const defaultSort: Sort = {
    prop: "createTime",
    //order: "ascending"
    order: "descending"
  };

  const searchFormParams = reactive<WorkTimeListCommand>({
    pocId: undefined,
    //beginDate: dayjs().format("YYYY-MM-DD"),
    //endDate: dayjs().format("YYYY-MM-DD"),
    beginDate: undefined,
    endDate: undefined,
    week: undefined
  });

  const formRef = ref();

  const dataList = ref([]);
  const pageLoading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const sortState = ref<Sort>(defaultSort);

  const pocList = ref([]);

  const deptTreeList = ref([]);

  const userList = ref([]);

  const columns: TableColumnList = [
    // {
    //   type: "selection",
    //   align: "left"
    // },
    {
      label: "工时编号",
      prop: "workTimeId",
      minWidth: 100
    },
    {
      label: "姓名",
      prop: "nickname",
      minWidth: 120
    },
    {
      label: "项目组",
      prop: "deptName",
      minWidth: 80
    },
    {
      label: "POC编号",
      prop: "pocId",
      //sortable: "custom",
      minWidth: 80
    },
    {
      label: "客户名称",
      prop: "customer",
      minWidth: 120
    },
    {
      label: "项目名称",
      prop: "project",
      minWidth: 200
    },
    {
      label: "开始日期",
      minWidth: 120,
      prop: "beginDate",
      sortable: "custom",
      formatter: ({ beginDate }) =>
        beginDate ? dayjs(beginDate).format("YYYY-MM-DD") : ""
    },
    {
      label: "结束日期",
      minWidth: 120,
      prop: "endDate",
      sortable: "custom",
      formatter: ({ endDate }) =>
        endDate ? dayjs(endDate).format("YYYY-MM-DD") : ""
    },
    {
      label: "周",
      prop: "week",
      minWidth: 60
    },
    {
      label: "工时（小时）",
      prop: "workHours",
      minWidth: 100
    },
    {
      label: "工作事项",
      prop: "workContent",
      minWidth: 120,
      cellRenderer: CommonUtils.truncateRenderer
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
      label: "修改时间",
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

  const hasSelectDate = val => {
    const date = new Date(val);
    const y = date.getFullYear();
    const m = date.getMonth();

    const d = date.getDate();
    const week = date.getDay();
    const start = new Date(y, m, d - week + 1);
    const end = new Date(y, m, d - week + 7);

    searchFormParams.beginDate = CommonUtils.getCurrentTime(start, 0);
    searchFormParams.endDate = CommonUtils.getCurrentTime(end, 0);
    searchFormParams.week = CommonUtils.getWeekNumber(end);
  };

  async function exportAllExcel() {
    //CommonUtils.fillPaginationParams(searchFormParams, pagination);
    //exportPocExcelApi(toRaw(searchFormParams), "POC列表.xls");

    if (sortState.value != null) {
      CommonUtils.fillSortParams(searchFormParams, sortState.value);
    }
    CommonUtils.fillPaginationParams(searchFormParams, pagination);

    exportWorkTimeExcelApi(toRaw(searchFormParams), "POC工时列表.xlsx");
  }

  async function handleAdd(row, done) {
    await addWorkTimeApi(row as UpdateWorkTimeCommand).then(() => {
      message(`您新增了工时${row.project} 的这条数据`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      getWorkTimeList();
    });
  }

  async function handleUpdate(row, done) {
    await updateWorkTimeApi(row as UpdateWorkTimeCommand).then(() => {
      message(`您修改了工时${row.workTimeId} 的这条数据`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      getWorkTimeList();
    });
  }

  async function handleDelete(row) {
    await deleteWorkTimeApi(row.pocId).then(() => {
      message(`您删除了工时${row.workTimeId} 的这条数据`, { type: "success" });
      // 刷新列表
      getWorkTimeList();
    });
  }

  function onSortChanged(sort: Sort) {
    sortState.value = sort;
    // 表格列的排序变化的时候，需要重置分页
    pagination.currentPage = 1;
    getWorkTimeList();
  }

  async function onWatch() {
    // 点击搜索的时候 需要重置分页
    pagination.currentPage = 1;
    getWorkTimeList();
  }

  async function onSearch(tableRef) {
    // 点击搜索的时候 需要重置分页
    //pagination.currentPage = 1;
    //getList();
    // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
    tableRef.getTableRef().sort("createTime", "descending");
  }

  async function openDialog(title = "新增", row?: UpdateWorkTimeCommand) {
    // TODO 如果是编辑的话  通过获取POC详情接口来获取数据
    if (title == "编辑") {
      row.beginDate = dayjs(row?.beginDate).format("YYYY-MM-DD");
      row.endDate = dayjs(row?.endDate).format("YYYY-MM-DD");
    }

    addDialog({
      title: `${title} POC工时`,
      props: {
        formInline: {
          workTimeId: row?.workTimeId ?? undefined,
          pocId: row?.pocId ?? undefined,
          userId: row?.userId ?? useUserStoreHook().userId,
          beginDate: row?.beginDate ?? CommonUtils.getNewBeginDate(),
          endDate: row?.endDate ?? CommonUtils.getNewEndDate(),
          week: row?.week ?? CommonUtils.getNewWeek(),
          workHours: row?.workHours ?? 0,
          workContent: row?.workContent ?? ""
        },
        pocsOptions: pocList
      },

      width: "50%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      alignCenter: true,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const formRuleRef = formRef.value.getFormRuleRef();
        const curData = options.props.formInline as UpdateWorkTimeCommand;

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

  async function getWorkTimeList() {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, pagination);
    //CommonUtils.fillTimeRangeParams(searchFormParams, timeRange.value);

    pageLoading.value = true;
    const { data } = await getWorkTimeListApi(toRaw(searchFormParams)).finally(
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
    onSearch(tableRef);
  }

  onMounted(async () => {
    //onSearch();
    getWorkTimeList();

    const pocListAllResponse = await getPocListAllApi();
    pocList.value = pocListAllResponse.data;

    const deptResponse = await getDeptListApi({});
    deptTreeList.value = await setDisabledForTreeOptions(
      handleTree(deptResponse.data),
      "status"
    );

    const userListNoPageResponse = await getUserListNoPageApi({});
    userList.value = userListNoPageResponse.data;
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
    defaultSort,
    onSortChanged,
    resetForm,
    handleUpdate,
    getWorkTimeList,
    handleDelete,
    pocList,
    userList,
    deptTreeList,
    hasSelectDate,
    onWatch
  };
}
