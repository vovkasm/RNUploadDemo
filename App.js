import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { Camera, Permissions } from "expo";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      hasCameraPermission: null,
      showScreen: false,
      imgSource: "",
      imgHeight: null,
      imgWidth: null,
      base64: ""
    };
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  snap = async () => {
    if (this.camera) {
      let photoFile = await this.camera
        .takePictureAsync({ base64: true })
        .then(photo => {
          this.setState({
            showScreen: true,
            base64: photo.base64,
            imgSource: photo.uri
          });
          if (photo.base64 !== "") {
            this.uploadPictureToserver(photo);
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  };

  uploadPictureToserver = photo => {
    const urlBase64 = "/upload/base64";

    let options = {
      method: "post",
      headers: {
        "Content-type": "text/plain"
      },
      body: photo.base64
    };
    fetch(urlBase64, options)
      .then(res => {
        console.log(res);
      })
      .catch(e => {
        console.log("catch");
        console.log(e);
      });
  };

  handleBack = () => {
    this.setState({
      showScreen: false
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.showScreen ? (
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Image
              style={{ width: 100, height: 100 }}
              source={{ uri: this.state.imgSource }}
            />
            <TouchableOpacity
              style={{
                flex: 1,
                alignSelf: "flex-end",
                alignItems: "center"
              }}
              onPress={this.handleBack}
            >
              <Text style={{ fontSize: 18, marginBottom: 10, color: "pink" }}>
                {" "}
                Back{" "}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Camera
            style={{ flex: 1 }}
            ref={ref => {
              this.camera = ref;
            }}
            type={this.state.type}
            autoFocus="on"
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "row"
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignSelf: "flex-end",
                  alignItems: "center"
                }}
                onPress={this.snap}
              >
                <Text
                  style={{ fontSize: 18, marginBottom: 200, color: "white" }}
                >
                  {" "}
                  Flip{" "}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
