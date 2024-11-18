import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  Flex,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useState } from "react";

export default function Configurator(props) {
  const { secondary, isOpen, onClose, fixed, ...rest } = props;

  const { colorMode, toggleColorMode } = useColorMode();
  let fixedDisplay = "flex";
  if (props.secondary) {
    fixedDisplay = "none";
  }

  const settingsRef = React.useRef();
  return (
    <>
      <Drawer
        isOpen={props.isOpen}
        onClose={props.onClose}
        placement={document.documentElement.dir === "rtl" ? "left" : "right"}
        finalFocusRef={settingsRef}
        blockScrollOnMount={false}
      >
        <DrawerContent>
          <DrawerHeader pt="24px" px="24px">
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody w="340px" ps="24px" pe="40px">

            <Flex
              justifyContent="space-between"
              alignItems="center"
              mb="24px"
            >
              <Text fontSize="md" fontWeight="600" mb="4px">
                Dark/Light
              </Text>
              <Button onClick={toggleColorMode}>
                Toggle {colorMode === "light" ? "Dark" : "Light"}
              </Button>
            </Flex>

          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
Configurator.propTypes = {
  secondary: PropTypes.bool,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  fixed: PropTypes.bool,
};
