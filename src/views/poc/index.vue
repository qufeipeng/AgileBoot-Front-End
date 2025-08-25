<script setup lang="ts">
import { ref } from "vue";
import { usePocHook } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
// TODO 这个导入声明好长  看看如何优化
import { CommonUtils } from "@/utils/common";
import PocFormModal from "@/views/poc/poc-form-modal.vue";
import EditPen from "@iconify-icons/ep/edit-pen";
import { PocPageResponse } from "@/api/poc";
import AddFill from "@iconify-icons/ri/add-circle-line";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "Poc"
});

const status = [
  {
    value: "待启动",
    label: "待启动"
  },
  {
    value: "POC中",
    label: "POC中"
  },
  {
    value: "POC暂停",
    label: "POC暂停"
  },
  {
    value: "POC完成-待推进",
    label: "POC完成-待推进"
  },
  {
    value: "POC完成-取消",
    label: "POC完成-取消"
  },
  {
    value: "上线实施中",
    label: "上线实施中"
  },
  {
    value: "已上线",
    label: "已上线"
  },
  {
    value: "转维护",
    label: "转维护"
  },
  {
    value: "生态适配中",
    label: "生态适配中"
  },
  {
    value: "生态适配完成",
    label: "生态适配完成"
  },
  {
    value: "取消",
    label: "取消"
  },
  {
    value: "其他",
    label: "其他"
  }
];

const risks = [
  {
    value: "无风险",
    label: "无风险"
  },
  {
    value: "低风险",
    label: "低风险"
  },
  {
    value: "高风险",
    label: "高风险"
  }
];

const tableRef = ref();

const searchFormRef = ref();
const {
  searchFormParams,
  pageLoading,
  columns,
  dataList,
  pagination,
  //timeRange,
  defaultSort,
  multipleSelection,
  onSearch,
  resetForm,
  onSortChanged,
  exportAllExcel,
  getPocList,
  handleDelete,
  handleBulkDelete
} = usePocHook();

const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
const opRow = ref<PocPageResponse>();
function openDialog(type: "add" | "update", row?: PocPageResponse) {
  opType.value = type;
  opRow.value = row;
  modalVisible.value = true;
}
</script>

<template>
  <div class="main">
    <!-- 搜索栏 -->
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="客户" prop="customer">
        <el-input
          v-model="searchFormParams.customer"
          placeholder="请输入客户"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="项目名称" prop="project">
        <el-input
          v-model="searchFormParams.project"
          placeholder="请选择项目名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="负责人" prop="owner">
        <el-input
          v-model="searchFormParams.owner"
          placeholder="请选择负责人"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="searchFormParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option
            v-for="dict in status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="风险" prop="risk">
        <el-select
          v-model="searchFormParams.risk"
          placeholder="请选择风险"
          clearable
          class="!w-[180px]"
        >
          <el-option
            v-for="dict in risks"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="pageLoading"
          @click="onSearch(tableRef)"
        >
          搜索
        </el-button>
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="resetForm(searchFormRef, tableRef)"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- table bar 包裹  table -->
    <PureTableBar title="POC项目列表" :columns="columns" @refresh="onSearch">
      <!-- 表格操作栏 -->
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增POC
        </el-button>
        <el-button
          type="danger"
          :icon="useRenderIcon(Delete)"
          @click="handleBulkDelete(tableRef)"
        >
          批量删除
        </el-button>
        <el-button
          type="primary"
          @click="CommonUtils.exportExcel(columns, dataList, 'POC列表')"
          >单页导出</el-button
        >
        <el-button type="primary" @click="exportAllExcel">全部导出</el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          ref="tableRef"
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="pageLoading"
          :size="size"
          adaptive
          :data="dataList"
          :columns="dynamicColumns"
          :default-sort="defaultSort"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="getPocList"
          @page-current-change="getPocList"
          @sort-change="onSortChanged"
          @selection-change="
            rows => (multipleSelection = rows.map(item => item.pocId))
          "
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('update', row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`是否确认删除编号为${row.pocId}的这个POC`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <poc-form-modal
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      @success="onSearch"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
