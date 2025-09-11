<script setup lang="ts">
import { ref, watch } from "vue";
import { formRules } from "./rule";
import { UpdateWorkTimeCommand } from "@/api/time";
import { CommonUtils } from "@/utils/common";

interface FormProps {
  formInline: UpdateWorkTimeCommand;
  pocsOptions: any[];
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    workTimeId: undefined,
    pocId: undefined,
    userId: undefined,
    workHours: undefined,
    workContent: undefined,
    beginDate: undefined,
    endDate: undefined,
    week: undefined
  }),
  pocsOptions: () => []
});

const hasSelectDate = val => {
  const date = new Date(val);
  const y = date.getFullYear();
  const m = date.getMonth();

  const d = date.getDate();
  const week = date.getDay();
  const start = new Date(y, m, d - week + 1);
  const end = new Date(y, m, d - week + 7);

  newFormInline.value.beginDate = CommonUtils.getCurrentTime(start, 0);
  newFormInline.value.endDate = CommonUtils.getCurrentTime(end, 0);
  newFormInline.value.week = CommonUtils.getWeekNumber(end);
};

const newFormInline = ref(props.formInline);
const pocsOptions = ref(props.pocsOptions);

const formRuleRef = ref();

function getFormRuleRef() {
  return formRuleRef.value;
}

defineExpose({ getFormRuleRef });

watch(
  [() => newFormInline.value.beginDate, () => newFormInline.value.endDate],
  () => {
    if (newFormInline.value.beginDate == "1969-12-29") {
      newFormInline.value.beginDate = "";
    }
    if (newFormInline.value.endDate == "1970-01-04") {
      newFormInline.value.endDate = "";
    }
  }
);
</script>

<template>
  <el-form
    ref="formRuleRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="130px"
  >
    <el-form-item prop="beginDate" label="周" required>
      <el-date-picker
        style="width: 100%"
        v-model="newFormInline.beginDate"
        type="week"
        :format="
          newFormInline.beginDate +
          ' 至 ' +
          newFormInline.endDate +
          '   (第' +
          newFormInline.week +
          '周)'
        "
        placeholder="请选择日期"
        @change="hasSelectDate"
      />
    </el-form-item>

    <el-form-item label="项目名称" prop="pocId">
      <el-select
        class="w-full"
        v-model="newFormInline.pocId"
        placeholder="请选择项目名称"
        clearable
        filterable
      >
        <el-option
          v-for="dict in pocsOptions"
          :key="dict.pocId"
          :label="dict.project"
          :value="dict.pocId"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="工时（小时）" prop="workHours">
      <el-input-number
        style="width: 100%"
        :min="0.5"
        v-model="newFormInline.workHours"
        clearable
        placeholder="请输入工时"
      />
    </el-form-item>

    <el-form-item label="工作事项" prop="workContent">
      <el-input
        v-model="newFormInline.workContent"
        clearable
        placeholder="请输入工作事项"
        type="textarea"
        rows="5"
      />
    </el-form-item>
  </el-form>
</template>
