<template>
  <div>
    <div class="pic-cutter-body">
      <div class="part-left">
        <button class="pic-choose-btn" v-if="!canvas" @click="ChoosePic">
          选择图片样本
        </button>
        <div :style="cutAreaStyle" class="cut-area"></div>
      </div>
      <div class="part-right">
        <p>设置裁剪参数</p>
        <div>
          <div v-if="!btnStatus.selectAreaBtn.alreadyChoose">
            <div>
              <div>裁剪矩形宽，默认200</div>
              <input v-model="cutCfg.w" type="number" />
            </div>
            <div>
              <div>裁剪矩形高，默认200</div>
              <input v-model="cutCfg.h" type="number" />
            </div>
            <div>
              <div>裁剪矩形偏移X，默认0</div>
              <input v-model="cutCfg.x" type="number" />
            </div>
            <div>
              <div>裁剪矩形偏移Y，默认0</div>
              <input v-model="cutCfg.y" type="number" />
            </div>
          </div>
          <p>
            <button
              @click="selectCutArea"
              :disabled="
                !btnStatus.selectAreaBtn.canUse ||
                btnStatus.selectAreaBtn.alreadyChoose
              "
            >
              选定裁剪区域
            </button>
          </p>
          <p>
            <button
              @click="getImg"
              :disabled="!btnStatus.selctFileListBtn.canUse"
            >
              选择图片并裁剪
            </button>
          </p>
          <p>保存图片质量等级</p>
          <div class="save-pic-level" v-if="btnStatus.selctFileListBtn.canUse">
            <button
              :class="{ isactive: picSaveLeval === 'origin' }"
              @click="picSaveLeval = 'origin'"
            >
              原画
            </button>
            <button
              :class="{ isactive: picSaveLeval !== 'origin' }"
              @click="picSaveLeval = 0.5"
            >
              其他
            </button>
          </div>
          <div v-if="picSaveLeval !== 'origin'">
            <input
              type="number"
              v-model="picSaveLeval"
              min="0.1"
              max="1"
              step="0.1"
            />
            <div>非原画时，为保证透明度不丢失图片将保存为webp格式</div>
          </div>

          <p>裁剪区域预览</p>
          <canvas
            id="preview-canvas"
            :width="parseInt(cutCfg.w)"
            :height="parseInt(cutCfg.h)"
          ></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {},
  data() {
    return {
      picSaveLeval: "origin",
      curIndex: 0,
      canvas: null,
      ctx: null,
      img: null,
      curCtxW: "200",
      curCtxH: "200",
      btnStatus: {
        selectAreaBtn: {
          canUse: false,
          alreadyChoose: false
        },
        selctFileListBtn: {
          canUse: false,
          alreadyChoose: false
        }
      },
      cutCfg: {
        x: 0,
        y: 0,
        w: "200",
        h: "200"
      }
    };
  },
  watch: {
    cutCfg: {
      handler(cfg) {
        if (!this.img || !this.ctx) return;
        if (this.curCtxW !== cfg.w || this.curCtxH !== cfg.h) {
          this.ctxInit();
          this.curCtxH = cfg.h;
          this.curCtxW = cfg.w;
        }
        this.$nextTick(() => {
          this.ctx.clearRect(0, 0, parseInt(cfg.w), parseInt(cfg.h));
          this.ctx.drawImage(
            this.img,
            parseInt(cfg.x),
            parseInt(cfg.y),
            parseInt(cfg.w),
            parseInt(cfg.h),
            0,
            0,
            parseInt(cfg.w),
            parseInt(cfg.h)
          );
        });
      },
      deep: true
    }
  },
  computed: {
    cutAreaStyle() {
      if (!this.canvas || !this.ctx) return "display:none";
      return `width:${parseInt(this.cutCfg.w)}px;height:${parseInt(
        this.cutCfg.h
      )}px;left:${parseInt(this.cutCfg.x)}px;top:${parseInt(this.cutCfg.y)}px`;
    }
  },
  methods: {
    selectCutArea() {
      this.btnStatus.selectAreaBtn.alreadyChoose = true;
      this.btnStatus.selctFileListBtn.canUse = true;
    },
    ChoosePic() {
      const self = this;
      return new Promise((resolve, reject) => {
        try {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/gif,image/jpg,image/png,image/jpeg";
          input.click();
          input.onchange = function(e) {
            const pic = e.path[0].files[0];
            const fileReader = new FileReader();
            fileReader.readAsDataURL(pic);
            fileReader.onload = function(res) {
              const data = res.currentTarget.result;
              self.img = document.createElement("img");
              self.img.id = "pic-element";
              self.img.src = data;
              const tempDom = document.getElementsByClassName("part-left")[0];
              tempDom.appendChild(self.img);
              self.ctxInit();
              self.img.onload = function() {
                self.ctx.drawImage(
                  self.img,
                  parseInt(self.cutCfg.x),
                  parseInt(self.cutCfg.y),
                  parseInt(self.cutCfg.w),
                  parseInt(self.cutCfg.h),
                  0,
                  0,
                  parseInt(self.cutCfg.w),
                  parseInt(self.cutCfg.h)
                );
                self.btnStatus.selectAreaBtn.canUse = true;
              };
            };
          };
        } catch (error) {
          reject(error);
        }
      });
    },
    ctxInit() {
      this.canvas = document.getElementById("preview-canvas");
      this.ctx = this.canvas.getContext("2d");
    },
    getImg() {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/gif,image/jpg,image/png,image/jpeg";
        input.multiple = true;
        input.click();
        const self = this;
        input.onchange = async function(e) {
          const fileList = e.path[0].files;
          self.cutFile(fileList);
        };
      } catch (error) {
        throw new Error(error);
      }
    },
    cutFile(list) {
      const self = this;
      const fileReader = new FileReader();
      fileReader.readAsDataURL(list[self.curIndex.toString()]);
      const canvas = document.createElement("canvas");
      canvas.width = parseInt(self.cutCfg.w);
      canvas.height = parseInt(self.cutCfg.h);
      const ctx = canvas.getContext("2d");
      fileReader.onload = function(res) {
        const data = res.currentTarget.result;
        const img = document.createElement("img");
        img.src = data;
        img.onload = function() {
          ctx.drawImage(
            img,
            parseInt(self.cutCfg.x),
            parseInt(self.cutCfg.y),
            parseInt(self.cutCfg.w),
            parseInt(self.cutCfg.h),
            0,
            0,
            parseInt(self.cutCfg.w),
            parseInt(self.cutCfg.h)
          );
          const dataURL =
            self.picSaveLeval === "origin"
              ? canvas.toDataURL()
              : canvas.toDataURL("image/webp", self.picSaveLeval);
          const a = document.createElement("a");
          a.href = dataURL;
          a.download =
            self.picSaveLeval === "origin"
              ? `${list[self.curIndex.toString()].name}`
              : `${list[self.curIndex.toString()].name}.webp`;
          a.click();

          if (self.curIndex < list.length - 1) {
            self.curIndex++;
            setTimeout(() => {
              self.cutFile(list);
            }, 50);
          } else {
            self.curIndex = 0;
          }
        };
      };
    }
  }
};
</script>

<style lang='less' scoped>
.pic-cutter-body {
  display: flex;
  border: 1px solid #000;
  height: max-content;
  width: max-content;
  margin: 15vh auto 0 auto;
  .isactive {
    background: cornflowerblue;
  }
}
.part-right {
  min-width: 400px;
  max-width: max-content;
  flex-shrink: 0;
  border-left: 1px solid black;
}
.part-left {
  position: relative;
  min-width: 400px;
  max-width: max-content;
  min-height: 400px;
  max-height: max-content;
  flex: 1;
}
.cut-area {
  cursor: move;
  transition: 0.1s;
  width: 200px;
  height: 200px;
  background: unset;
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid #000;
  z-index: 1;
}
.pic-choose-btn {
  display: block;
  margin: auto;
  width: max-content;
  padding: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#preview-canvas {
  margin: 20px auto 0 auto;
  border: 1px solid #000;
}
</style>
