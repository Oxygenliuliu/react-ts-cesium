import { Component } from 'react'
import * as Cesium from 'cesium'
import '../../../node_modules/cesium/Build/Cesium/Widgets/widgets.css'

// import 'cesium/Build/Cesium/Widgets/widgets.css'

const { NODE_ENV } = process.env;
  
// window.CESIUM_BASE_URL = NODE_ENV === 'development'? JSON.stringify('') : JSON.stringify('static')

const MapConfig = {
    ION: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMzJmNDgwZi1iNmQ2LTQ0NWEtOWRkNi0wODkxYzYxYTg0ZDIiLCJpZCI6ODUzMiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MjIwMjY4OH0.u4d7x0IxZY06ThT4JFmxrfgBxVjQcfI6xXDLu-fsWsY',
    global: {
        enableLighting: false,
        depthTestAgainstTerrain: true,
    },
    MAPOPTIONS: {
        imageryProviderViewModels: [
            new Cesium.ProviderViewModel({
                name: "Google卫星",
                iconUrl: "http://img3.cache.netease.com/photo/0031/2012-03-22/7T6QCSPH1CA10031.jpg",
                tooltip: "Google卫星",
                creationFunction () {
                    return new Cesium.UrlTemplateImageryProvider({
                        url: 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}',// 影像图 (中国范围无偏移)
                        tilingScheme: new Cesium.WebMercatorTilingScheme(),
                        minimumLevel: 1,
                        maximumLevel: 200,
                        credit: 'Google Earth',
                    });
                }
            }),
        ], // 设置影像图列表
        shouldAnimate: true,
        geocoder: false, // 右上角查询按钮
        shadows: false,
        terrainProviderViewModels: [],// 设置地形图列表
        animation: false,             // 动画小窗口
        baseLayerPicker: false,        // 图层选择器
        fullscreenButton: false,      // 全屏
        vrButton: false,              // vr按钮
        homeButton: false,            // home按钮
        infoBox: false,
        sceneModePicker: false,       // 2D,2.5D,3D切换
        selectionIndicator: false,
        timeline: false,              // 时间轴
        navigationHelpButton: false,  // 帮助按钮
        terrainShadows: Cesium.ShadowMode.DISABLED,
    },
};

class CesiumViewer extends Component<{id?: string, setUp?: boolean, onViewerLoaded?: (viewer: Cesium.Viewer) => void}> {
    private v_iewer: Cesium.Viewer | undefined
    get viewer() { return this.v_iewer }
    private constructor(props?: any) {
        super(props);
        this.state = {
            beActive: false
        }
    }
    private get containerId() {
        return this.props.id || '__cesiumContainer'
    }
    componentDidMount() {
        window.CESIUM_BASE_URL = CESIUM_BASE_URL
        if(this.props.setUp !== false) this.setUp()
    }
    setUp(options?: {
        imageryProvider?: any,
        imageryProviderViewModels?: Cesium.ProviderViewModel[],
        orderIndependentTranslucency?: boolean,
        contextOptions?: { webgl?: { alpha?: boolean }},
        ION?: string
    }): Cesium.Viewer {
        console.log("开启cesium")
        this.setState({ beActive: true})
        Cesium.Ion.defaultAccessToken = options?.ION || MapConfig.ION
        const viewer: Cesium.Viewer = new Cesium.Viewer(this.containerId, { ...MapConfig.MAPOPTIONS, ...options });
        (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";// 去除版权信息
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)// 移除双击选中
        
        viewer.scene.globe.enableLighting = MapConfig.global.enableLighting// 光照开关
        viewer.scene.globe.depthTestAgainstTerrain = MapConfig.global.depthTestAgainstTerrain// 开启深度测试 
       
        viewer.canvas.oncontextmenu = e=> {
            if( e.button === 2 ) e.preventDefault()
        }

        viewer.frameUpdate = new Cesium.Event()
        let lastTime: number;
        viewer.scene.preUpdate.addEventListener(()=> {
            const dateNow: number = Date.now()
            const deltaTime = lastTime !== null ? dateNow - lastTime : 0
            lastTime = dateNow
            viewer.frameUpdate.raiseEvent(deltaTime)
        })
        return viewer
    }
    beforeDestory = new Cesium.Event()
    destroy() {
        this.beforeDestory.raiseEvent()
        console.log("cesium摧毁")
        this.v_iewer?.destroy()
        this.v_iewer = undefined;
    }

    componentWillUnmount() {
        this.destroy()
    }

    render() {
        const { beActive } = this.state
        const { children } = this.props
        const containerStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: beActive ? 'block' : 'none'    
        }
        return (
            <div id={ this.containerId } style={ containerStyle }>
                { children }
            </div>
        )
    }
}

export default CesiumViewer
