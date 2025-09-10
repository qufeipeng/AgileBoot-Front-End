import { PaginationProps, TableColumn } from "@pureadmin/table";
import { Sort } from "element-plus";
import { utils, writeFile } from "xlsx";
import { message } from "./message";
import { pinyin } from "pinyin-pro";
import { h } from "vue";
import dayjs from "dayjs";

export class CommonUtils {
  static getBeginTimeSafely(timeRange: string[]): string {
    if (timeRange == null) {
      return undefined;
    }

    if (timeRange.length <= 0) {
      return undefined;
    }

    if (timeRange[0] == null) {
      return undefined;
    }

    return timeRange[0];
  }

  static getEndTimeSafely(timeRange: string[]): string {
    if (timeRange == null) {
      return undefined;
    }

    if (timeRange.length <= 1) {
      return undefined;
    }

    if (timeRange[1] == null) {
      return undefined;
    }

    return timeRange[1];
  }

  static fillPaginationParams(
    baseQuery: BasePageQuery,
    pagination: PaginationProps
  ) {
    baseQuery.pageNum = pagination.currentPage;
    baseQuery.pageSize = pagination.pageSize;
  }

  static fillSortParams(baseQuery: BasePageQuery, sort: Sort) {
    if (sort == null) {
      return;
    }
    baseQuery.orderColumn = sort.prop;
    baseQuery.orderDirection = sort.order;
  }

  /** 适用于BaseQuery中固定的时间参数  beginTime和endTime参数 */
  static fillTimeRangeParams(baseQuery: any, timeRange: string[]) {
    if (timeRange == null || timeRange.length == 0 || timeRange === undefined) {
      baseQuery["beginTime"] = undefined;
      baseQuery["endTime"] = undefined;
      return;
    }

    if (baseQuery == null || baseQuery === undefined) {
      return;
    }

    baseQuery["beginTime"] = CommonUtils.getBeginTimeSafely(timeRange);
    baseQuery["endTime"] = CommonUtils.getEndTimeSafely(timeRange);
  }

  static exportExcel(
    columns: TableColumnList,
    originalDataList: any[],
    excelName: string
  ) {
    if (
      !Array.isArray(columns) ||
      !Array.isArray(originalDataList) ||
      typeof excelName !== "string"
    ) {
      message("参数异常，导出失败", { type: "error" });
      return;
    }

    // columns和dataList为空的话 弹出提示 不执行导出
    if (columns.length === 0 || originalDataList.length === 0) {
      message("无法导出空列表", { type: "warning" });
      return;
    }

    const titleList: string[] = [];
    const dataKeyList: string[] = [];
    // 把columns里面的label取出来作为excel的列标题，把prop取出来等下从dataList里面根据作为key取对象中的值
    columns.forEach((column: TableColumn) => {
      if (column.label && column.prop) {
        titleList.push(column.label);
        dataKeyList.push(column.prop as string);
      }
    });

    const excelDataList: string[][] = originalDataList.map(item => {
      const arr = [];
      dataKeyList.forEach(dataKey => {
        arr.push(item[dataKey]);
      });
      return arr;
    });

    excelDataList.unshift(titleList);

    const workSheet = utils.aoa_to_sheet(excelDataList);
    const workBook = utils.book_new();
    utils.book_append_sheet(workBook, workSheet, excelName);
    writeFile(workBook, `${excelName}.xlsx`);
  }

  static paginateList(dataList: any[], pagination: PaginationProps): any[] {
    // 计算起始索引
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;

    // 截取数组
    const endIndex = startIndex + pagination.pageSize;
    const paginatedList = dataList.slice(startIndex, endIndex);

    // 返回截取后的数组
    return paginatedList;
  }

  static toPinyin(chineseStr: string): string {
    if (chineseStr == null || chineseStr === undefined || chineseStr === "") {
      return chineseStr;
    }

    const pinyinStr = pinyin(chineseStr, { toneType: "none" });
    return pinyinStr.replace(/\s/g, "");
  }

  static truncateRenderer(scope) {
    // 获取当前单元格的原始值
    const cellValue = scope.row[scope.column.property] || ""; // 或使用 scope.row[prop]
    // 截取前10个字符
    const truncatedText =
      cellValue.length > 10 ? cellValue.substring(0, 10) + "..." : cellValue;

    // 返回一个带有样式（可选）的HTML字符串
    //return `<span title="${cellValue}" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${truncatedText}</span>`;
    //return `${truncatedText}`;

    return h(
      "span",
      {
        style:
          "display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
        title: cellValue // 鼠标悬停提示完整内容
        // 可以添加类名、事件等
        //class: 'truncated-text'
      },
      truncatedText // 作为文本子节点
    );
  }

  static getWeekNumber = date => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dateTimeStamp = date.getTime();
    const yearStartTimeStamp = startOfYear.getTime();
    const diff = dateTimeStamp - yearStartTimeStamp;
    const daysSinceStartOfYear = diff / (1000 * 60 * 60 * 24);
    const weeks = Math.floor(daysSinceStartOfYear / 7);
    return weeks + 1;
  };

  static getCurrentTime = (data, num) => {
    const date = new Date(data);
    const Y = date.getFullYear();
    const M = date.getMonth();
    const D = date.getDate() + num;
    //return Y + '-'+ M + "-" + D;
    //return new Date(Y, M, D);
    return dayjs(new Date(Y, M, D)).format("YYYY-MM-DD");
  };

  static getNewBeginDate = () => {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();

    const d = date.getDate();
    const week = date.getDay();
    const start = new Date(y, m, d - week + 1);

    return this.getCurrentTime(start, 0);
  };

  static getNewEndDate = () => {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();

    const d = date.getDate();
    const week = date.getDay();
    const end = new Date(y, m, d - week + 7);

    return this.getCurrentTime(end, 0);
  };

  static getNewWeek = () => {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();

    const d = date.getDate();
    const week = date.getDay();
    const end = new Date(y, m, d - week + 7);

    return this.getWeekNumber(end);
  };

  // 私有构造函数，防止类被实例化
  private constructor() {}
}
