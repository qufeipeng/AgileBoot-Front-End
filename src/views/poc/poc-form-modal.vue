<script setup lang="ts">
import VDialog from "@/components/VDialog/VDialog.vue";
import { computed, reactive, ref } from "vue";
import {
  AddPocCommand,
  PocPageResponse,
  UpdatePocCommand,
  addPocApi,
  updatePocApi
} from "@/api/poc";
import { useUserStoreHook } from "@/store/modules/user";
import { ElMessage, FormInstance, FormRules } from "element-plus";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: PocPageResponse;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

const formData = reactive<AddPocCommand | UpdatePocCommand>({
  owner: "",
  status: "",
  customer: "",
  project: "",
  progress: 0,
  risk: "",
  todo_risk: "",
  done: "",
  sales: "",
  sa: "",
  poc: "",
  op: "",
  kv: "",
  pocStartDt: null,
  pocEndDt: null,
  onlineDt: null,
  lastUpdDt: null,
  province: "",
  industry: "",
  isv: "",
  maintenance: "",
  version: "",
  deployment: "",
  compatibility: "",
  plugins: "",
  notes: "",
  deptId: 0
});

const statusList = useUserStoreHook().dictionaryMap["common.status"];

const rules: FormRules = {
  owner: [
    {
      required: true,
      message: "当前责任人不能为空"
    }
  ],
  customer: [
    {
      required: true,
      message: "客户名称不能为空"
    }
  ],
  project: [
    {
      required: true,
      message: "项目名称不能为空"
    }
  ]
};
const formRef = ref<FormInstance>();
function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  } else {
    formRef.value?.resetFields();
  }
}

const loading = ref(false);
async function handleConfirm() {
  try {
    loading.value = true;
    if (props.type === "add") {
      await addPocApi(formData);
    } else if (props.type === "update") {
      await updatePocApi(formData as UpdatePocCommand);
    }
    ElMessage.info("提交成功");
    visible.value = false;
    emits("success");
  } catch (e) {
    console.error(e);
    ElMessage.error((e as Error)?.message || "提交失败");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增POC' : '更新POC'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item prop="owner" label="当前责任人" required inline-message>
        <el-input v-model="formData.owner" />
      </el-form-item>
      <el-form-item prop="customer" label="客户名称" required>
        <el-input v-model="formData.customer" />
      </el-form-item>
      <el-form-item prop="project" label="项目名称" required>
        <el-input v-model="formData.project" />
      </el-form-item>
      <el-form-item prop="progress" label="进度" required>
        <el-input-number :min="1" v-model="formData.progress" />
      </el-form-item>
      <el-form-item prop="status" label="状态">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="item in Object.keys(statusList)"
            :key="item"
            :label="statusList[item].value"
            >{{ statusList[item].label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="notes" label="备注" style="margin-bottom: 0">
        <el-input type="textarea" v-model="formData.notes" />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>
