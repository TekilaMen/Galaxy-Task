import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
  View,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  getAllBoards,
  getListsFromBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from "../functions.min.js";
import { Dropdown } from "react-native-element-dropdown";
import colors from "../Colors.min.js";

// Import your images
const galaxyImages = [
  require("../assets/indexPlanetNew.png"),
  require("../assets/galaxy.png"),
  require("../assets/galaxy1.png"),
  require("../assets/galaxy2.png"),
  require("../assets/galaxy3.png"),
  require("../assets/galaxy4.png"),
];

const { width, height } = Dimensions.get("window");
const backgroundImage = require("../assets/indexPhoto.png");
const title = require("../assets/indexTitle.png");

const Galaxy = ({ navigation, route }) => {
  const { idOrganization } = route.params || {};
  const [galaxies, setGalaxies] = useState([]);
  const [value, setValue] = React.useState("0"); // Select Value id for Dropdown
  const [valueName, setValueName] = React.useState(); // Select Value  name for Dropdown
  const [refresh, setRefresh] = useState(false); // Use to recall the useEffect
  const [modalVisible, setModalVisible] = useState(false); // Modal for create board
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Modal for update board
  const [inputValue, setInputValue] = useState(""); // Input value for create board
  const [text, onChangeText] = React.useState(""); // Input value for update board
  const indexImage = 0;
  const galaxyData = galaxies.map((galaxy) => ({
    label: galaxy.name,
    value: galaxy.id.toString(),
  }));

  const [isLoading, setIsLoading] = useState(true);
  const handleGalaxySelect = (galaxy) => {
    if (galaxy.id === "0") {
      setModalVisible(true);
    } else {
      getListsFromBoard(galaxy.id)
        .then((lists) => {
          const listNames = lists.map((list) => list.name);
          const listId = lists.map((list) => list.id);
          // Naviguez vers l'écran AppScreen et passez les noms des listes
          navigation.navigate("Home", {
            planetNames: listNames,
            listIds: listId,
            boardId: galaxy.id,
            idOrganization: idOrganization,
          });
        })
        .catch(console.error);
    }
  };

  modifyBoard = async (idBoard, name) => {
    try {
      const response = await updateBoard(idBoard, name);
      setRefresh(true);
      setModalUpdateVisible(!modalUpdateVisible);
    } catch (error) {
      console.error(error);
    }
  };

  unSetBoard = async (idBoard) => {
    Alert.alert(
      "Delete board",
      "Are you sure you want to delete this board?",
      [
        {
          text: "Cancel",
          onPress: () => setModalUpdateVisible(!modalUpdateVisible),
          style: "cancel",
        },
        { text: "OK", onPress: () => confirmDelete(idBoard) },
      ],
      { cancelable: false }
    );
  };

  confirmDelete = async (idBoard) => {
    try {
      const response = await deleteBoard(idBoard);
      setRefresh(true);
      setModalUpdateVisible(!modalUpdateVisible);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGalaxyLongSelect = (name) => {
    if (name != "New Board") {
      setValueName(name);
      setModalUpdateVisible(true);
    }
  };

  const addBoard = async () => {
    if (galaxyData.length - 1 === 10) {
      alert("You can't create more than 10 boards");
      return;
    } else {
      try {
        const response = await createBoard(inputValue, idOrganization);
        setRefresh(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    getAllBoards(idOrganization)
      .then((boards) => {
        setGalaxies((prevGalaxies) => [
          { id: "0", name: "New Board" },
          ...boards,
        ]);
        setIsLoading(false);
        setRefresh(false);
      })
      .catch(console.error);
  }, [refresh]);

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="cover"
      style={styles.image}
    >
      <Image source={title} style={styles.title} resizeMode="contain" />
      {galaxies.map((galaxy, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleGalaxySelect(galaxy)}
          onLongPress={() => handleGalaxyLongSelect(galaxy.name)}
          style={
            galaxy.id === value
              ? styles.selectedGalaxyImage
              : styles.unselectedGalaxyImage
          }
        >
          <Image
            source={galaxyImages[galaxy.id === "0" ? 0 : (index % 5) + 1]}
            style={styles.galaxyImage}
            resizeMode="contain"
          />
          <Text
            style={[styles.galaxyName, { textAlign: "center", width: 150 }]}
          >
            {galaxy.name}
          </Text>
        </TouchableOpacity>
      ))}
      {!isLoading && (
        <View style={styles.dropdownContainer}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            data={galaxyData}
            labelField="label"
            valueField="value"
            placeholder="Select a board"
            value={galaxyData.label}
            onChange={(item) => setValue(item.value)}
          />
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 35,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                marginBottom: 20,
                fontWeight: "bold",
              }}
            >
              Create a new board
            </Text>

            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                width: 200,
                marginBottom: 20,
                textAlign: "center",
                backgroundColor: "#f8f8f8",
                borderRadius: 5,
                paddingHorizontal: 10,
              }}
              onChangeText={(text) => setInputValue(text)}
              value={inputValue}
              placeholder="Enter board name"
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: 200,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "green",
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginRight: 10,
                  alignItems: "center",
                }}
                onPress={() => {
                  addBoard(inputValue, idOrganization);
                  setInputValue(""); // Reset input value
                  setModalVisible(!modalVisible); // Close modal
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Create
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "red",
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginLeft: 10,
                  alignItems: "center",
                }}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUpdateVisible}
        onRequestClose={() => {
          setModalVisible(!modalUpdateVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 35,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                marginBottom: 20,
                fontWeight: "bold",
              }}
            >
              Edit board
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                width: 200,
                marginBottom: 20,
                textAlign: "center",
                backgroundColor: "#f8f8f8",
                borderRadius: 5,
                paddingHorizontal: 10,
              }}
              value={text}
              onChangeText={(text) => onChangeText(text)}
              placeholder={valueName}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: 200,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "green",
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginRight: 10,
                  alignItems: "center",
                }}
                onPress={() => {
                  modifyBoard(value, text);

                  onChangeText(""); // Reset input value

                  setModalUpdateVisible(!modalUpdateVisible); // Close modal
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "gray",
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  alignItems: "center",
                }}
                onPress={() => {
                  unSetBoard(value);
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Delete
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "red",
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginLeft: 10,
                  alignItems: "center",
                }}
                onPress={() => setModalUpdateVisible(!modalUpdateVisible)}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  galaxyImage: {
    width: width * 0.3,
    height: height * 0.3,
  },
  galaxyName: {
    fontSize: 30,
    color: "white",
    alignSelf: "center",
    width: 5000,
  },
  title: {
    width: width * 0.8,
    height: height * 0.1,
    top: height * 0.001,
    left: width * 0.12,
  },
  unselectedGalaxyImage: {
    bottom: height * 10,
    left: width * Math.random(),
  },
  selectedGalaxyImage: {
    position: "absolute",
    top: height / 2 - 100 / 2,
    left: width / 2 - 90 / 2,
    transform: [{ translateX: -50 / 2 }, { translateY: -200 / 2 }],
    height: 100,
  },
  dropdownContainer: {
    position: "absolute",
    width: "90%",
    top: "76%",
    left: "5%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
  },
  dropdownPlaceholder: {
    color: colors.black,
  },
  dropdownSelectedText: {
    color: colors.black,
  },
});

export default Galaxy;
