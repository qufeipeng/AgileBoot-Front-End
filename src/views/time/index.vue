<script setup lang="ts">
import { ref, watch } from "vue";
import { useHook } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { CommonUtils } from "@/utils/common";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "WorkTime"
});

const tableRef = ref();

const searchFormRef = ref();
const {
  searchFormParams,
  pageLoading,
  columns,
  dataList,
  pagination,
  defaultSort,
  onSearch,
  resetForm,
  onSortChanged,
  exportAllExcel,
  getWorkTimeList,
  handleDelete,
  openDialog,
  pocList,
  userList,
  deptTreeList,
  hasSelectDate,
  getSummaries,
  customerList,
  onWatch
} = useHook();

watch(
  [
    () => searchFormParams.pocId,
    () => searchFormParams.customer,
    () => searchFormParams.deptId,
    () => searchFormParams.userId,
    () => searchFormParams.beginDate,
    () => searchFormParams.endDate
  ],
  () => {
    onWatch();
  }
);
const value1 = ref("");
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
      <el-form-item label="周" prop="beginDate">
        <el-date-picker
          class="!w-[300px]"
          v-model="value1"
          type="week"
          :format="
            searchFormParams.beginDate +
            ' 至 ' +
            searchFormParams.endDate +
            '   (第' +
            searchFormParams.week +
            '周)'
          "
          placeholder="请选择日期"
          @change="hasSelectDate"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="customer">
        <el-select
          v-model="searchFormParams.customer"
          placeholder="请选择客户名称"
          clearable
          filterable
          class="!w-[200px]"
        >
          <el-option
            v-for="customer in customerList"
            :key="customer"
            :label="customer"
            :value="customer"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目名称" prop="pocId">
        <el-select
          v-model="searchFormParams.pocId"
          placeholder="请选择项目名称"
          clearable
          filterable
          class="!w-[300px]"
        >
          <el-option
            v-for="dict in pocList"
            :key="dict.pocId"
            :label="dict.project"
            :value="dict.pocId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目组" prop="deptId">
        <el-tree-select
          class="w-full"
          v-model="searchFormParams.deptId"
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
          placeholder="请选择项目组"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="userId">
        <el-select
          v-model="searchFormParams.userId"
          placeholder="请选择姓名"
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
    <PureTableBar title="工时列表" :columns="columns" @refresh="onSearch">
      <!-- 表格操作栏 -->
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('新增')"
        >
          新增工时
        </el-button>
        <el-button
          type="primary"
          @click="CommonUtils.exportExcel(columns, dataList, '工时列表')"
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
          @page-size-change="getWorkTimeList"
          @page-current-change="getWorkTimeList"
          @sort-change="onSortChanged"
          :summary-method="getSummaries"
          show-summary
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
              编辑
            </el-button>
            <el-popconfirm
              :title="`是否确认删除编号为${row.workTimeId}的这个工时数据`"
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
