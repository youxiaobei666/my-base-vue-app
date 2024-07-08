<script lang="ts" setup>
import { ElDivider, ElTag } from "element-plus";
import { nextTick, onMounted, ref } from "vue";

const addressCoordinates = defineModel("searchContent");

const map = ref<any>(null);
const marker = ref<any>(null);
const searchQuery = ref<string>("");
const latLngValue = ref<any>({
  lat: 39.98040430730952,
  lng: 116.3087723004819,
});
const searchedAddressList = ref<any>([]);
const afterSearchedAddress = ref<string>("");

// 页面加载时初始化地图
onMounted(() => {
  nextTick(() => {
    initializeMap();
    if (addressCoordinates.value) {
      reverseGeocoder();
    }
  });
});

// 逆地理编码获取地址
const reverseGeocoder = () => {
  fetch(
    `/txMap/ws/geocoder/v1/?location=${addressCoordinates.value}&key=Q4WBZ-CSJCB-YWDUH-NOE7J-HX453-ECFPM`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 0) {
        afterSearchedAddress.value = data.result.addressCoordinates;
        console.log("逆地理编码结果:", afterSearchedAddress.value);
      } else {
        console.error("逆地理编码失败:", data.message);
      }
    })
    .catch((error) => {
      console.error("逆地理编码请求出错:", error);
    });
};

// 初始化地图
const initializeMap = () => {
  const mapElement = document.getElementById("map");
  if (mapElement) {
    map.value = new TMap.Map(mapElement, {
      center: new TMap.LatLng(latLngValue.value.lat, latLngValue.value.lng),
      zoom: 15,
    });

    // 初始化标记
    marker.value = new TMap.MultiMarker({
      map: map.value,
      geometries: [
        {
          id: "marker",
          position: map.value.getCenter(),
          properties: { title: "选择的位置" },
        },
      ],
    });

    // 地图点击事件
    map.value.on("click", (event: any) => {
      const { latLng } = event;
      console.log("点击地图的坐标:", latLng);
      latLngValue.value = latLng;

      // 更新标记位置
      marker.value.setGeometries([
        {
          id: "marker",
          position: latLng,
          properties: { title: "选择的位置" },
        },
      ]);

      // 更新坐标
      addressCoordinates.value = `${latLng.lat},${latLng.lng}`;
      console.log("更新后的address:", addressCoordinates.value);
    });
  } else {
    console.error("地图容器未找到");
  }
};

// 搜索地址
const searchAddress = () => {
  if (searchQuery.value.trim()) {
    fetch(
      `/txMap/ws/place/v1/search?keyword=${encodeURIComponent(
        searchQuery.value
      )}&boundary=nearby(${latLngValue.value.lat},${latLngValue.value.lng},1000,1)&key=Q4WBZ-CSJCB-YWDUH-NOE7J-HX453-ECFPM`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 0) {
          searchedAddressList.value = data.data;
          console.log("搜索结果:", data.data);
        } else {
          console.error("地址搜索失败:", data.message);
        }
      })
      .catch((error) => {
        console.error("地址搜索请求出错:", error);
      });
  }
};

// 更新选定的地址
const updateAddress = (data: any) => {
  afterSearchedAddress.value = `${data.title} | ${data.address}`;
  const { lat, lng } = data.location;
  const newCenter = new TMap.LatLng(lat, lng);
  map.value.setCenter(newCenter);
  marker.value.setGeometries([
    {
      id: "marker",
      position: newCenter,
      properties: { title: "选择的位置" },
    },
  ]);
  addressCoordinates.value = `${lat},${lng}`;
};
</script>

<template>
  <div>
    <ElInput
      type="text"
      v-model="searchQuery"
      placeholder="请输入地址"
      style="width: 300px; padding: 5px; margin-right: 10px"
    />
    <ElButton @click.prevent="searchAddress" type="primary">搜索</ElButton>
    <ElDivider />
    <ElTag>当前搜索后的地址： </ElTag>{{ afterSearchedAddress }}
    <ElDivider />
    <ElTag>当前点击后的地址： </ElTag>{{ addressCoordinates }}
    <ElDivider />
    <div>
      <ElTag>地址搜索结果如下：</ElTag>
      <div v-for="item in searchedAddressList" :key="item.id">
        <div
          @click="updateAddress(item)"
          style="border-bottom: solid 1px #000; padding: 5px; cursor: pointer"
        >
          {{ item.title }} | {{ item.address }}
        </div>
      </div>
    </div>
    <ElDivider />
    <div id="map" style="height: 500px; margin-top: 10px"></div>
  </div>
</template>

<style scoped lang="scss">
#map {
  width: 100%;
}
</style>
