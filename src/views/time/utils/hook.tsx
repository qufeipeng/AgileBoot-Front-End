import dayjs from "dayjs";
import { message } from "@/utils/message";
import { ElMessageBox, Sort } from "element-plus";
import { reactive, ref, onMounted, toRaw, computed } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { CommonUtils } from "@/utils/common";
import { PaginationProps } from "@pureadmin/table";
import {
  WorkTimeListCommand,
  getWorkTimeListApi,
  exportWorkTimeExcelApi,
  deleteWorkTimeApi
} from "@/api/time";
import { getPocListAllApi } from "@/api/poc";

const statusMap = useUserStoreHook().dictionaryMap["common.status"];

export function useHook() {
  const defaultSort: Sort = {
    prop: "createTime",
    //order: "ascending"
    order: "descending"
  };

  const pagination: PaginationProps = {
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  };

  const dateRange = computed<[string, string] | null>({
    get() {
      if (searchFormParams.beginDate && searchFormParams.endDate) {
        return [searchFormParams.beginDate, searchFormParams.endDate];
      } else {
        return null;
      }
    },
    set(v) {
      if (v?.length === 2) {
        searchFormParams.beginDate = v[0];
        searchFormParams.endDate = v[1];
      } else {
        searchFormParams.beginDate = undefined;
        searchFormParams.endDate = undefined;
      }
    }
  });

  const searchFormParams = reactive<WorkTimeListCommand>({
    beginDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
    week: 0
  });

  const dataList = ref([]);
  const pocList = ref([]);
  const pageLoading = ref(true);
  const multipleSelection = ref([]);
  const sortState = ref<Sort>(defaultSort);

  const columns: TableColumnList = [
    {
      type: "selection",
      align: "left"
    },
    {
      label: "岗位编号",
      prop: "postId",
      minWidth: 100
    },
    {
      label: "岗位编码",
      prop: "postCode",
      minWidth: 120
    },
    {
      label: "岗位名称",
      prop: "postName",
      minWidth: 120
    },
    {
      label: "岗位排序",
      prop: "postSort",
      sortable: "custom",
      minWidth: 120
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 120,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={statusMap[row.status].cssTag}
          effect="plain"
        >
          {statusMap[row.status].label}
        </el-tag>
      )
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
    //const Y = date.getFullYear();
    const M = date.getMonth() + 1;
    const D = date.getDate() + num;
    return M + "." + D;
  };

  function onSortChanged(sort: Sort) {
    sortState.value = sort;
    // 表格列的排序变化的时候，需要重置分页
    pagination.currentPage = 1;
    getWorkTimeList();
  }

  async function onSearch(tableRef) {
    // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
    tableRef.getTableRef().sort("createTime", "ascending");
  }

  function resetForm(formEl, tableRef) {
    if (!formEl) return;
    // 清空查询参数
    formEl.resetFields();
    // 清空时间查询  TODO  这块有点繁琐  有可以优化的地方吗？
    // Form组件的resetFields方法无法清除datepicker里面的数据。
    searchFormParams.beginDate = undefined;
    searchFormParams.endDate = undefined;
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
    CommonUtils.fillTimeRangeParams(searchFormParams, dateRange.value);

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

  onMounted(getWorkTimeList);
  onMounted(async () => {
    getWorkTimeList();

    const pocAllResponse = await getPocListAllApi({});
    pocList.value = pocAllResponse.data;
  });

  return {
    searchFormParams,
    pageLoading,
    columns,
    dataList,
    pagination,
    defaultSort,
    dateRange,
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
    pocList
  };
}
