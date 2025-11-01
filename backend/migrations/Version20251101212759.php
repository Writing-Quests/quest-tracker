<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251101212759 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7EFD08CB2
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7E85F12B8
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA79D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D8FDDAB70
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE interaction
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE post
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE connection DROP notify_initiating_user, DROP notify_connected_user
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project CHANGE details details JSON DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE interaction (id INT AUTO_INCREMENT NOT NULL, post_id_id INT NOT NULL, user_id_id INT NOT NULL, content VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, INDEX IDX_378DFDA79D86650F (user_id_id), INDEX IDX_378DFDA7E85F12B8 (post_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE post (id INT AUTO_INCREMENT NOT NULL, owner_id_id INT NOT NULL, created_at DATETIME NOT NULL, edited_at DATETIME NOT NULL, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, title VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, INDEX IDX_5A8A6C8D8FDDAB70 (owner_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7EFD08CB2 FOREIGN KEY (post_id_id) REFERENCES feed_entry (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7E85F12B8 FOREIGN KEY (post_id_id) REFERENCES post (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7A76ED395 FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA79D86650F FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D8FDDAB70 FOREIGN KEY (owner_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE connection ADD notify_initiating_user TINYINT(1) DEFAULT NULL, ADD notify_connected_user TINYINT(1) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project CHANGE details details JSON DEFAULT 'json_object()'
        SQL);
    }
}
