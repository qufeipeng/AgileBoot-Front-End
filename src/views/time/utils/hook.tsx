import dayjs from "dayjs";
import { message } from "@/utils/message";
import { ElMessageBox, Sort } from "element-plus";
import { reactive, ref, onMounted, toRaw } from "vue";
import { CommonUtils } from "@/utils/common";
import { PaginationProps } from "@pureadmin/table";
import {
  WorkTimeListCommand,
  getWorkTimeListApi,
  exportWorkTimeExcelApi,
  deleteWorkTimeApi
} from "@/api/time";
import { getPocListAllApi } from "@/api/poc";
import { handleTree, setDisabledForTreeOptions } from "@/utils/tree";
import { getDeptListApi } from "@/api/system/dept";
import { getUserListNoPageApi } from "@/api/system/user";

export function useHook() {
  const defaultSort: Sort = {
    prop: "beginDate",
    //order: "ascending"
    order: "descending"
  };

  const pagination: PaginationProps = {
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  };

  const searchFormParams = reactive<WorkTimeListCommand>({
    pocId: undefined,
    //beginDate: dayjs().format("YYYY-MM-DD"),
    //endDate: dayjs().format("YYYY-MM-DD"),
    beginDate: undefined,
    endDate: undefined,
    week: undefined
  });

  const dataList = ref([]);
  const pocList = ref([]);
  const deptTreeList = ref([]);
  const userList = ref([]);
  const pageLoading = ref(true);
  const multipleSelection = ref([]);
  const sortState = ref<Sort>(defaultSort);

  const columns: TableColumnList = [
    {
      type: "selection",
      align: "left"
    },
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
      formatter: ({ beginDate }) => dayjs(beginDate).format("YYYY-MM-DD")
    },
    {
      label: "结束日期",
      minWidth: 120,
      prop: "endDate",
      sortable: "custom",
      formatter: ({ endDate }) => dayjs(endDate).format("YYYY-MM-DD")
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
      label: "修改时间",
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

  const hasSelectDate = val => {
    const date = new Date(val);
    const y = date.getFullYear();
    const m = date.getMonth();

    const d = date.getDate();
    const week = date.getDay();
    const start = new Date(y, m, d - week + 1);
    const end = new Date(y, m, d - week + 7);

    searchFormParams.beginDate = getCurrentTime(start, 0);
    searchFormParams.endDate = getCurrentTime(end, 0);
    searchFormParams.week = getWeekNumber(end);
  };

  const getWeekNumber = date => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dateTimeStamp = date.getTime();
    const yearStartTimeStamp = startOfYear.getTime();
    const diff = dateTimeStamp - yearStartTimeStamp;
    const daysSinceStartOfYear = diff / (1000 * 60 * 60 * 24);
    const weeks = Math.floor(daysSinceStartOfYear / 7);
    return weeks + 1;
  };

  const getCurrentTime = (data, num) => {
    const date = new Date(data);
    const Y = date.getFullYear();
    const M = date.getMonth();
    const D = date.getDate() + num;
    //return Y + '-'+ M + "-" + D;
    //return new Date(Y, M, D);
    return dayjs(new Date(Y, M, D)).format("YYYY-MM-DD");
  };

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
    // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
    tableRef.getTableRef().sort("beginDate", "ascending");
  }

  function resetForm(formEl, tableRef) {
    if (!formEl) return;
    // 清空查询参数
    formEl.resetFields();
    // 清空时间查询  TODO  这块有点繁琐  有可以优化的地方吗？
    // Form组件的resetFields方法无法清除datepicker里面的数据。
    searchFormParams.beginDate = undefined;
    searchFormParams.endDate = undefined;
    searchFormParams.week = undefined;
    // 重置分页并查询
    onSearch(tableRef);
  }

  async function getWorkTimeList() {
    pageLoading.value = true;
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, pagination);

    const { data } = await getWorkTimeListApi(toRaw(searchFormParams)).finally(
      () => {
        pageLoading.value = false;
      }
    );
    dataList.value = data.rows;
    pagination.total = data.total;
  }

  async function exportAllExcel() {
    if (sortState.value != null) {
      CommonUtils.fillSortParams(searchFormParams, sortState.value);
    }
    CommonUtils.fillPaginationParams(searchFormParams, pagination);

    exportWorkTimeExcelApi(toRaw(searchFormParams), "岗位数据.xlsx");
  }

  async function handleDelete(row) {
    await deleteWorkTimeApi(row.workTimeId).then(() => {
      message(`您删除了编号为${row.workTimeId}的这条工时数据`, {
        type: "success"
      });
      // 刷新列表
      getWorkTimeList();
    });
  }

  async function handleBulkDelete(tableRef) {
    if (multipleSelection.value.length === 0) {
      message("请选择需要删除的数据", { type: "warning" });
      return;
    }

    ElMessageBox.confirm(
      `确认要<strong>删除</strong>编号为<strong style='color:var(--el-color-primary)'>[ ${multipleSelection.value} ]</strong>的工时数据吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        await deleteWorkTimeApi(multipleSelection.value).then(() => {
          message(`您删除了编号为[ ${multipleSelection.value} ]的工时数据`, {
            type: "success"
          });
          // 刷新列表
          getWorkTimeList();
        });
      })
      .catch(() => {
        message("取消删除", {
          type: "info"
        });
        // 清空checkbox选择的数据
        tableRef.getTableRef().clearSelection();
      });
  }

  onMounted(async () => {
    getWorkTimeList();

    const pocAllResponse = await getPocListAllApi({});
    pocList.value = pocAllResponse.data;

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
    defaultSort,
    multipleSelection,
    onSearch,
    onSortChanged,
    exportAllExcel,
    // exportExcel,
    getWorkTimeList,
    resetForm,
    handleDelete,
    handleBulkDelete,
    hasSelectDate,
    pocList,
    userList,
    deptTreeList,
    onWatch
  };
}
