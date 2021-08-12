<?php

    function get_extdirect_api() {

        $API = array(
            'QueryEntradas' => array(
                'methods' => array(
                    'getResults' => array(
                        'len' => 1
                    )
                )
            )
        );

        return $API;

    }
// https://docs.sencha.com/extjs/6.2.0/guides/backend_connectors/direct/mysql_php.html