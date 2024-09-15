'use client';

import "@mantine/core/styles.css";
import React, { useState } from "react";
import { MantineProvider, ColorSchemeScript, Stack, Box, Divider, ScrollArea, Title, ActionIcon } from "@mantine/core";
import { usePathname } from "next/navigation";
import { AppShell, Group, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { SessionProvider } from "next-auth/react";
import { NewChatButton } from "./components/buttons/new_chat_button";
import ChatList from "./components/chats/prev_chats_list";
import { UserCard } from "./components/user/user_card";
import { theme } from "../theme";
import NextImage from 'next/image';
import MowasalatLogo from '../public/images/MowasalatLogo.svg'
import { Icon123, IconBoxAlignLeft, IconBoxAlignLeftFilled } from "@tabler/icons-react";

export default function RootLayout({ children }: { children: any }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const pathname = usePathname();
  const [shouldRefetch, setShouldRefetch] = useState(false); // State to trigger refetch in ChatList

  const noLayoutPaths = ["/login"];
  const isNoLayoutPage = noLayoutPaths.includes(pathname);

  const handleChatCreated = () => {
    setShouldRefetch(true); // Trigger refetch in ChatList
  };

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <SessionProvider>
          <MantineProvider theme={theme}>
            {isNoLayoutPage ? (
              children
            ) : (
              <AppShell
                navbar={{
                  width: 250,
                  breakpoint: "sm",
                  collapsed: {
                    mobile: !mobileOpened,
                    desktop: !desktopOpened,
                  },
                }}
                styles={{
                  main: {
                    height: '100vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  },
                }}
                transitionDuration={500}
                transitionTimingFunction="ease-in-out"
              >
                <AppShell.Header withBorder={false} p={10} pr={30} mr={20}>
                  <Group justify="space-between">
                    <Group justify="space-between">
                      <ActionIcon
                        onClick={toggleMobile}
                        hiddenFrom="sm"
                        size="sm"
                        variant="outline"
                      >
                        <IconBoxAlignLeftFilled size={20} />
                      </ActionIcon>
                      <ActionIcon
                        onClick={toggleDesktop}
                        visibleFrom="sm"
                        size="sm"
                        variant="outline"
                      >
                        <IconBoxAlignLeftFilled size={20} />
                      </ActionIcon>
                      <NewChatButton onChatCreated={handleChatCreated} />
                    </Group>

                    <UserCard />

                  </Group>

                </AppShell.Header>
                <AppShell.Main>
                  {children}
                </AppShell.Main>
                <AppShell.Navbar p='md' bg={"#f8f8f8"} withBorder={false}>
                  <Group justify="space-between">
                    <ActionIcon
                      onClick={toggleMobile}
                      hiddenFrom="sm"
                      size="sm"
                      variant="outline"
                    >
                      <IconBoxAlignLeft size={20} />
                    </ActionIcon>

                    <ActionIcon
                      onClick={toggleDesktop}
                      visibleFrom="sm"
                      size="sm"
                      variant="outline"
                    >
                      <IconBoxAlignLeft size={20} />
                    </ActionIcon>
                    <NewChatButton onChatCreated={handleChatCreated} />
                  </Group>
                  <Stack gap="sm" mt={20} mb={20}>
                    <Image component={NextImage} src={MowasalatLogo} alt="My image" />
                  </Stack>
                  <ScrollArea style={{ flexGrow: 1 }}>
                    <ChatList shouldRefetch={shouldRefetch} setShouldRefetch={setShouldRefetch} /> {/* Pass refetch state */}
                  </ScrollArea>

                </AppShell.Navbar>
              </AppShell>
            )}
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
