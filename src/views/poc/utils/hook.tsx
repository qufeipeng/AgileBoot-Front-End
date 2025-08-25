import dayjs from "dayjs";
import { message } from "@/utils/message";
import { ElMessageBox, Sort } from "element-plus";
import { reactive, ref, onMounted, toRaw, computed } from "vue";
import { CommonUtils } from "@/utils/common";
import { PaginationProps } from "@pureadmin/table";
import {
  PocListCommand,
  getPocListApi,
  exportPocExcelApi,
  deletePocApi
} from "@/api/poc";

export function usePocHook() {
  const defaultSort: Sort = {
    prop: "createTime",
    order: "ascending"
  };

  const pagination: PaginationProps = {
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  };

  const timeRange = computed<[string, string] | null>({
    get() {
      if (searchFormParams.beginTime && searchFormParams.endTime) {
        return [searchFormParams.beginTime, searchFormParams.endTime];
      } else {
        return null;
      }
    },
    set(v) {
      if (v?.length === 2) {
        searchFormParams.beginTime = v[0];
        searchFormParams.endTime = v[1];
      } else {
        searchFormParams.beginTime = undefined;
        searchFormParams.endTime = undefined;
      }
    }
  });

  const searchFormParams = reactive<PocListCommand>({
    customer: "",
    project: "",
    status: "",
    owner: "",
    risk: ""
  });

  const dataList = ref([]);
  const pageLoading = ref(true);
  const multipleSelection = ref([]);
  const sortState = ref<Sort>(defaultSort);

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
      label: "部门名称",
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
      minWidth: 120
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
      minWidth: 120
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

  function onSortChanged(sort: Sort) {
    sortState.value = sort;
    // 表格列的排序变化的时候，需要重置分页
    pagination.currentPage = 1;
    getPocList();
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
    searchFormParams.beginTime = undefined;
    searchFormParams.endTime = undefined;
    // 重置分页并查询
    onSearch(tableRef);
  }

  async function getPocList() {
    pageLoading.value = true;
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, pagination);

    const { data } = await getPocListApi(toRaw(searchFormParams)).finally(
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
    CommonUtils.fillTimeRangeParams(searchFormParams, timeRange.value);

    exportPocExcelApi(toRaw(searchFormParams), "POC数据.xlsx");
  }

  async function handleDelete(row) {
    await deletePocApi([row.postId]).then(() => {
      message(`您删除了编号为${row.pocId}的这条POC数据`, {
        type: "success"
      });
      // 刷新列表
      getPocList();
    });
  }

  async function handleBulkDelete(tableRef) {
    if (multipleSelection.value.length === 0) {
      message("请选择需要删除的数据", { type: "warning" });
      return;
    }

    ElMessageBox.confirm(
      `确认要<strong>删除</strong>编号为<strong style='color:var(--el-color-primary)'>[ ${multipleSelection.value} ]</strong>的POC数据吗?`,
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
        await deletePocApi(multipleSelection.value).then(() => {
          message(`您删除了编号为[ ${multipleSelection.value} ]的POC数据`, {
            type: "success"
          });
          // 刷新列表
          getPocList();
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

  onMounted(getPocList);

  return {
    searchFormParams,
    pageLoading,
    columns,
    dataList,
    pagination,
    defaultSort,
    timeRange,
    multipleSelection,
    onSearch,
    onSortChanged,
    exportAllExcel,
    // exportExcel,
    getPocList,
    resetForm,
    handleDelete,
    handleBulkDelete
  };
}
