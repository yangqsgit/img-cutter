<template>
  <div id="box">
    <button @click="getImg">选择图片序列</button>
    <canvas id="preview-canvas" width="750" height="750"></canvas>
  </div>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      canvas: null,
      ctx: null,
      curIndex: 0,
      videoStream: null,
      isCaptureStream: false,
      recorder: null
    };
  },
  computed: {},
  mounted() {
    this.ctxInit();
  },
  methods: {
    ctxInit() {
      this.canvas = document.getElementById("preview-canvas");
      this.ctx = this.canvas.getContext("2d");
    },
    mediaRecorder(stream) {
      var options = {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        mimeType: "video/webm"
      };
      var mediaRecorder = new MediaRecorder(stream, options);
      return mediaRecorder;
    },
    downloadVideo(blob) {
      const _a = document.createElement("a");
      _a.href = URL.createObjectURL(blob);
      _a.target = "_blank";
      _a.download = `ccccc.mp4`;
      _a.click();
    },
    /**
     * 加载本地图片序列,完成后绘制。
     */
    getImg() {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/gif,image/jpg,image/png,image/jpeg,image/webp";
        input.multiple = true;
        input.click();
        ``;
        const self = this;
        input.onchange = function(e) {
          const fileList = e.path[0].files;
          // 图片加载时间不固定，加载完成后根据名字中的数字标记将fileList序列化。
          const tempList = Object.values(fileList).sort((a, b) => {
            return (
              a.name.split(".")[0].split("_")[1] -
              b.name.split(".")[0].split("_")[1]
            );
          });
          self.videoStream = self.canvas.captureStream(30);
          self.recorder = self.mediaRecorder(self.videoStream);
          self.recorder.start();
          self.recorder.ondataavailable = function(e) {
            const newVideo = new Blob([e.data], { type: "video/mp4" });
            self.downloadVideo(newVideo);
          };
          self.drawFile(tempList);
        };
      } catch (error) {
        throw new Error(error);
      }
    },
    /**
     * 使用canvas逐帧绘制图片。
     * @param {list} 图片序列.
     */
    drawFile(list) {
      const self = this;
      const fileReader = new FileReader();
      const tempFile = list[self.curIndex];
      parseInt(tempFile.name.split(".")[0].split("_")[1]);
      fileReader.readAsDataURL(tempFile);
      fileReader.onload = function(res) {
        const data = res.currentTarget.result;
        const img = document.createElement("img");
        img.src = data;
        img.onload = function() {
          self.ctx.clearRect(0, 0, 750, 750);
          self.ctx.drawImage(img, 0, 0, 750, 750);
          if (self.curIndex < list.length - 1) {
            setTimeout(() => {
              self.curIndex++;
              self.drawFile(list);
            }, 1000 / 30);
          } else {
            self.curIndex = 0;
            self.ctx.clearRect(0, 0, 750, 750);
            self.recorder.stop();
          }
        };
      };
    }
  }
};
</script>

<style lang='less' scoped>
button {
  width: max-content;
  padding: 0 5px;
}
#box {
  display: flex;
  flex-direction: column;
}
#preview-canvas {
  width: 750px;
  height: 750px;
}
</style>
