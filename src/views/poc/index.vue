<script setup lang="ts">
import { ref, watch } from "vue";
import { useHook } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Download from "@iconify-icons/ep/download";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { CommonUtils } from "@/utils/common";

defineOptions({
  name: "Poc"
});

const tableRef = ref();

const formRef = ref();
const {
  searchFormParams,
  pageLoading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  pocStartDtTimeRange,
  pocEndDtTimeRange,
  onlineDtTimeRange,
  defaultSort,
  onSortChanged,
  exportAllExcel,
  handleDelete,
  openDialog,
  getPocList,
  status,
  risks,
  userList
} = useHook();

watch(
  //() => searchFormParams.pocId,
  [
    () => searchFormParams.pocId,
    () => searchFormParams.customer,
    () => searchFormParams.project,
    () => searchFormParams.owner,
    () => searchFormParams.poc,
    () => searchFormParams.status,
    () => searchFormParams.risk
  ],
  () => {
    onSearch(tableRef);
  }
);
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="POC编号" prop="pocId">
        <el-input
          v-model="searchFormParams.pocId"
          placeholder="请输入POC编号"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
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
      <el-form-item label="当前责任人" prop="owner">
        <el-select
          v-model="searchFormParams.owner"
          placeholder="请选择当前责任人"
          clearable
          class="!w-[180px]"
        >
          <el-option
            v-for="item in userList"
            :key="item.userId"
            :label="item.nickname"
            :value="item.userId"
            :disabled="item.status == 0"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="当前责任人" prop="owner">
        <el-tree-select
          class="w-full"
          v-model="searchFormParams.owner"
          :data="deptTreeList"
          :show-all-levels="false"
          value-key="id"
          :props="{
            value: 'id',
            label: 'deptName',
            emitPath: false,
            checkStrictly: true
          }"
          clearable
          placeholder="请选择当前责任人"
        />
      </el-form-item> -->
      <el-form-item label="POC人员" prop="poc">
        <el-select
          v-model="searchFormParams.poc"
          placeholder="请选择POC人员"
          clearable
          class="!w-[180px]"
        >
          <el-option
            v-for="item in userList"
            :key="item.userId"
            :label="item.nickname"
            :value="item.userId"
            :disabled="item.status == 0"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="POC人员" prop="poc">
        <el-tree-select
          class="w-full"
          v-model="searchFormParams.poc"
          :data="deptTreeList"
          :show-all-levels="false"
          value-key="id"
          :props="{
            value: 'id',
            label: 'deptName',
            emitPath: false,
            checkStrictly: true
          }"
          clearable
          placeholder="请选择POC人员"
        />
      </el-form-item> -->
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
      <el-form-item label="开始日期" prop="pocStartDt">
        <el-date-picker
          class="!w-[240px]"
          v-model="pocStartDtTimeRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="完成日期" prop="pocEndDt">
        <el-date-picker
          class="!w-[240px]"
          v-model="pocEndDtTimeRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="上线日期" prop="OnlineDt">
        <el-date-picker
          class="!w-[240px]"
          v-model="onlineDtTimeRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
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
          @click="resetForm(formRef, tableRef)"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="POC项目列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('新增')"
        >
          新增POC
        </el-button>
        <el-button
          type="primary"
          @click="CommonUtils.exportExcel(columns, dataList, 'POC列表')"
          >单页导出</el-button
        >
        <el-button
          type="warning"
          :icon="useRenderIcon(Download)"
          @click="exportAllExcel"
        >
          全部导出
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          ref="tableRef"
          adaptive
          align-whole="center"
          table-layout="auto"
          :loading="pageLoading"
          :size="size"
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
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDialog('编辑', row)"
              :icon="useRenderIcon(EditPen)"
            >
              修改
            </el-button>
            <el-popconfirm title="是否确认删除?" @confirm="handleDelete(row)">
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
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
