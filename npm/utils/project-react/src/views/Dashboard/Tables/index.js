import { Flex } from "@chakra-ui/react";
import React from "react";
import Authors from "./components/Authors";

function Tables() {

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Authors title={"Players Table"} />
    </Flex>
  );
}

export default Tables;
